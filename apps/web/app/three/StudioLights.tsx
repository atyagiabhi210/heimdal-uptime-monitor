import { Environment, Lightformer, SpotLight } from "@react-three/drei";

const StudioLights = () => {
  return (
    <group name="studioLights">
      <Environment resolution={256}>
        <group>
          {/* a large rectangle light studio effect */}
          <Lightformer
            form="rect"
            intensity={10}
            position={[-10, 5, -5]}
            scale={10}
            rotation-y={Math.PI / 2}
          />
          <Lightformer
            form="rect"
            intensity={10}
            position={[10, 0, 1]}
            scale={10}
            rotation-y={Math.PI / 2}
          />
          <Lightformer
            form="rect"
            intensity={10}
            position={[10, 8, 1]}
            scale={10}
            rotation-y={Math.PI / 2}
          />
        </group>
      </Environment>
      <SpotLight
        angle={1}
        decay={0}
        intensity={Math.PI * 0.2}
        position={[-2, 10, 5]}
      />
      <SpotLight
        angle={1}
        decay={0}
        intensity={Math.PI * 0.2}
        position={[0, -25, 10]}
      />
      <SpotLight
        angle={1}
        decay={0.1}
        intensity={Math.PI * 0.3}
        position={[0, 15, 5]}
      />
    </group>
  );
};

export default StudioLights;
