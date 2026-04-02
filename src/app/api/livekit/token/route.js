import { AccessToken } from "livekit-server-sdk";
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
);

export async function POST(request) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Missing auth token" }, { status: 401 });
    }

    const supabaseToken = authHeader.slice(7);
    const {
      data: { user },
      error: authError,
    } = await supabaseAdmin.auth.getUser(supabaseToken);

    if (authError || !user) {
      return NextResponse.json({ error: "Invalid auth token" }, { status: 401 });
    }

    const { roomId, sessionId } = await request.json();
    if (!roomId) {
      return NextResponse.json({ error: "roomId is required" }, { status: 400 });
    }

    const isAnonymous = user.is_anonymous === true;
    let canPublish = false;

    if (!isAnonymous) {
      const { data: roleData } = await supabaseAdmin
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .maybeSingle();

      if (roleData?.role === "admin" || roleData?.role === "editor") {
        canPublish = true;
      }
    }

    if (!isAnonymous && !canPublish) {
      const { data: stageData } = await supabaseAdmin
        .from("stages")
        .select("collaborator_ids")
        .eq("id", roomId)
        .maybeSingle();

      if (stageData?.collaborator_ids?.includes(user.id)) {
        canPublish = true;
      }

      const lobbyBaseId = roomId.replace(/-lobby$/, "");
      if (lobbyBaseId !== roomId) {
        const { data: lobbyStageData } = await supabaseAdmin
          .from("stages")
          .select("collaborator_ids, lobby_webcam_microphone_available")
          .eq("id", lobbyBaseId)
          .maybeSingle();

        if (lobbyStageData?.collaborator_ids?.includes(user.id)) {
          canPublish = true;
        }
        if (lobbyStageData?.lobby_webcam_microphone_available) {
          canPublish = true;
        }
      }
    }

    const { data: displayData } = await supabaseAdmin
      .from("display_names")
      .select("display_name, display_color")
      .eq("user_id", user.id)
      .maybeSingle();

    const identity = sessionId ? `${user.id}-${sessionId}` : user.id;

    const at = new AccessToken(
      process.env.LIVEKIT_API_KEY,
      process.env.LIVEKIT_API_SECRET,
      {
        identity,
        metadata: JSON.stringify({
          userId: user.id,
          displayName: displayData?.display_name || "",
          displayColor: displayData?.display_color || "#cdcdcd",
        }),
      },
    );

    at.addGrant({
      roomJoin: true,
      room: roomId,
      canPublish,
      canSubscribe: true,
      canPublishData: true,
    });

    const token = await at.toJwt();
    return NextResponse.json({ token });
  } catch (err) {
    console.error("Token generation error:", err);
    return NextResponse.json(
      { error: "Failed to generate token" },
      { status: 500 },
    );
  }
}
