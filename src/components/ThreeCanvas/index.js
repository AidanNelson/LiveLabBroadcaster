import { useStageContext } from "@/components/StageContext";
export const EditableCanvasFeatures = () => {
  const { stageInfo } = useStageContext();
  return (
    <>
      {/* {info.images.map((imageInfo, imageIndex) => {
  <EditableImage
  url={imageInfo.url}
  key={imageIndex}
  shapeProps={{ ...imageInfo.properties }}
  editable={shouldBeEditable}
  isSelected={imageInfo.id === selectedId}
  onSelect={() => {
      if (!shouldBeEditable) return;
      selectShape(imageInfo.id);
  }}
  onChange={(newAttrs) => {
      if (!shouldBeEditable) return;
      console.log('new attributes!', newAttrs);
      const updatedFeatureInfo = structuredClone(featureInfo);
      updatedFeatureInfo.images[imageIndex].properties = { ...updatedFeatureInfo.images[imageIndex].properties, ...newAttrs };
      updateFeature({ stageInfo, updatedFeature: updatedFeatureInfo, updatedFeatureIndex: featureIndex })
  }}
  onDelete={() => {
      if (!shouldBeEditable) return;
      console.log('deleting node');
      deleteImage({ stageInfo, featureInfo, imageToDeleteIndex: imageIndex });
  }}
/>

})} */}
    </>
  );
};
