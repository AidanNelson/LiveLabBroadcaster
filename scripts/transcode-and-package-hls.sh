# https://shaka-project.github.io/shaka-packager/html/tutorials/encoding.html

# Check if an input filename is provided
if [ -z "$1" ]; then
    echo "Usage: $0 <input_filename>"
    exit 1
fi

# Check if an output filename is provided
if [ -z "$2" ]; then
    echo "Usage: $0 <output_path>"
    exit 1
fi

# Input filename provided as the first argument
input_filename="$1"
output_path="$2"

transcoded_source_path="$output_path/transcoded"
hls_output_path="$output_path/hls"

# Check if the the transcoded file path exists, otherwise create it
if [ ! -d "$transcoded_source_path" ]; then
    # If it doesn't exist, create it
    mkdir -p "$transcoded_source_path"
    echo "Directory created: $transcoded_source_path"
else
    echo "Directory already exists: $transcoded_source_path"
fi
# Check if the the hls output file path exists, otherwise create it
if [ ! -d "$hls_output_path" ]; then
    # If it doesn't exist, create it
    mkdir -p "$hls_output_path"
    echo "Directory created: $hls_output_path"
else
    echo "Directory already exists: $hls_output_path"
fi

# transcode to 1080p
ffmpeg -i "$input_filename" \
  -c:a aac -b:a 128k \
  -vf "scale=-2:1080" \
  -c:v libx264 -profile:v high -level:v 4.2 \
  -x264-params scenecut=0:open_gop=0:min-keyint=72:keyint=72 \
  -minrate 6000k -maxrate 6000k -bufsize 6000k -b:v 6000k \
  -y "$transcoded_source_path/h264_high_1080p_6000.mp4"

# transcode to 720p
ffmpeg -i "$input_filename" \
   -c:a aac -b:a 128k \
   -vf "scale=-2:720" \
  -c:v libx264 -profile:v main -level:v 4.0 \
  -x264-params scenecut=0:open_gop=0:min-keyint=72:keyint=72 \
  -minrate 3000k -maxrate 3000k -bufsize 3000k -b:v 3000k \
  -y "$transcoded_source_path/h264_main_720p_3000.mp4"

# transcode to 480p
ffmpeg -i "$input_filename" \
  -c:a aac -b:a 128k \
  -vf "scale=-2:480" \
  -c:v libx264 -profile:v main -level:v 3.1 \
  -x264-params scenecut=0:open_gop=0:min-keyint=72:keyint=72 \
  -minrate 1000k -maxrate 1000k -bufsize 1000k -b:v 1000k \
  -y "$transcoded_source_path/h264_main_480p_1000.mp4"

# transcode to 360p
ffmpeg -i "$input_filename" \
  -c:a aac -b:a 128k \
  -vf "scale=-2:360" \
  -c:v libx264 -profile:v baseline -level:v 3.0 \
  -x264-params scenecut=0:open_gop=0:min-keyint=72:keyint=72 \
  -minrate 600k -maxrate 600k -bufsize 600k -b:v 600k \
  -y "$transcoded_source_path/h264_baseline_360p_600.mp4"

# package the above
packager \
  "in=$transcoded_source_path/h264_baseline_360p_600.mp4,stream=audio,segment_template=$hls_output_path/audio/\$Number$.aac,playlist_name=$hls_output_path/audio/main.m3u8,hls_group_id=audio,hls_name=ENGLISH" \
  "in=$transcoded_source_path/h264_main_480p_1000.mp4,stream=video,segment_template=$hls_output_path/h264_480p/\$Number$.ts,playlist_name=$hls_output_path/h264_480p/main.m3u8,iframe_playlist_name=$hls_output_path/h264_480p/iframe.m3u8" \
  "in=$transcoded_source_path/h264_main_720p_3000.mp4,stream=video,segment_template=$hls_output_path/h264_720p/\$Number$.ts,playlist_name=$hls_output_path/h264_720p/main.m3u8,iframe_playlist_name=$hls_output_path/h264_720p/iframe.m3u8" \
  "in=$transcoded_source_path/h264_high_1080p_6000.mp4,stream=video,segment_template=$hls_output_path/h264_1080p/\$Number$.ts,playlist_name=$hls_output_path/h264_1080p/main.m3u8,iframe_playlist_name=$hls_output_path/h264_1080p/iframe.m3u8" \
  --hls_master_playlist_output "$hls_output_path/manifest.m3u8"