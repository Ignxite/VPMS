import { useRef, useEffect, useCallback } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { useCarStore } from "@/state/carStore";

/** Low-poly car built from merged geometries */
function CarModel() {
  return (
    <group>
      {/* Body */}
      <mesh position={[0, 0.06, 0]} castShadow>
        <boxGeometry args={[0.22, 0.08, 0.45]} />
        <meshStandardMaterial color="#e8eaed" roughness={0.3} metalness={0.6} />
      </mesh>
      {/* Cabin */}
      <mesh position={[0, 0.12, -0.02]} castShadow>
        <boxGeometry args={[0.18, 0.07, 0.22]} />
        <meshStandardMaterial color="#9aa0a6" roughness={0.2} metalness={0.4} />
      </mesh>
      {/* Front left wheel */}
      <mesh position={[-0.1, 0, 0.13]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.03, 0.03, 0.04, 8]} />
        <meshStandardMaterial color="#333333" roughness={0.8} />
      </mesh>
      {/* Front right wheel */}
      <mesh position={[0.1, 0, 0.13]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.03, 0.03, 0.04, 8]} />
        <meshStandardMaterial color="#333333" roughness={0.8} />
      </mesh>
      {/* Rear left wheel */}
      <mesh position={[-0.1, 0, -0.13]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.03, 0.03, 0.04, 8]} />
        <meshStandardMaterial color="#333333" roughness={0.8} />
      </mesh>
      {/* Rear right wheel */}
      <mesh position={[0.1, 0, -0.13]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.03, 0.03, 0.04, 8]} />
        <meshStandardMaterial color="#333333" roughness={0.8} />
      </mesh>
      {/* Headlights */}
      <pointLight position={[0.06, 0.06, 0.25]} intensity={0.3} distance={3} color="#ffffee" />
      <pointLight position={[-0.06, 0.06, 0.25]} intensity={0.3} distance={3} color="#ffffee" />
      {/* Taillights (red glow) */}
      <mesh position={[0.08, 0.06, -0.225]}>
        <boxGeometry args={[0.03, 0.02, 0.005]} />
        <meshStandardMaterial color="#fc5c65" emissive="#fc5c65" emissiveIntensity={0.8} />
      </mesh>
      <mesh position={[-0.08, 0.06, -0.225]}>
        <boxGeometry args={[0.03, 0.02, 0.005]} />
        <meshStandardMaterial color="#fc5c65" emissive="#fc5c65" emissiveIntensity={0.8} />
      </mesh>
    </group>
  );
}

interface KeyState {
  w: boolean;
  s: boolean;
  a: boolean;
  d: boolean;
}

const Car = () => {
  const carRef = useRef<THREE.Group>(null);
  const { camera } = useThree();
  const thirdMode = useCarStore((state) => state.thirdMode);
  const setThirdMode = useCarStore((state) => state.setThirdMode);
  const keys = useRef<KeyState>({ w: false, s: false, a: false, d: false });
  const velocity = useRef(0);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      switch (e.key.toLowerCase()) {
        case "w":
        case "arrowup":
          keys.current.w = true;
          break;
        case "s":
        case "arrowdown":
          keys.current.s = true;
          break;
        case "a":
        case "arrowleft":
          keys.current.a = true;
          break;
        case "d":
        case "arrowright":
          keys.current.d = true;
          break;
        case "escape":
          setThirdMode(false);
          if (document.exitPointerLock) {
            document.exitPointerLock();
          }
          break;
        default:
          break;
      }
    },
    [setThirdMode]
  );

  const handleKeyUp = useCallback((e: KeyboardEvent) => {
    switch (e.key.toLowerCase()) {
      case "w":
      case "arrowup":
        keys.current.w = false;
        break;
      case "s":
      case "arrowdown":
        keys.current.s = false;
        break;
      case "a":
      case "arrowleft":
        keys.current.a = false;
        break;
      case "d":
      case "arrowright":
        keys.current.d = false;
        break;
      default:
        break;
    }
  }, []);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [handleKeyDown, handleKeyUp]);

  useEffect(() => {
    if (thirdMode) {
      const handleClick = () => {
        if (document.pointerLockElement !== document.body) {
          document.body.requestPointerLock();
        }
      };
      window.addEventListener("click", handleClick);
      return () => window.removeEventListener("click", handleClick);
    }
  }, [thirdMode]);

  useEffect(() => {
    if (thirdMode) {
      const onMouseMove = (event: MouseEvent) => {
        if (
          document.pointerLockElement === document.body &&
          carRef.current
        ) {
          carRef.current.rotation.y -= event.movementX * 0.002;
        }
      };
      document.addEventListener("mousemove", onMouseMove);
      return () => document.removeEventListener("mousemove", onMouseMove);
    }
  }, [thirdMode]);

  useFrame((_, delta) => {
    if (carRef.current) {
      const accelerationRate = 0.25;
      const maxSpeed = 4.0;
      const decelerationRate = 1.2;
      const turnSpeed = 0.025;

      if (keys.current.w) {
        velocity.current = Math.min(
          maxSpeed,
          velocity.current + accelerationRate * delta
        );
      } else if (keys.current.s) {
        velocity.current = Math.max(
          -maxSpeed,
          velocity.current - accelerationRate * delta
        );
      } else {
        if (velocity.current > 0) {
          velocity.current = Math.max(
            0,
            velocity.current - decelerationRate * delta
          );
        } else if (velocity.current < 0) {
          velocity.current = Math.min(
            0,
            velocity.current + decelerationRate * delta
          );
        }
      }

      if (keys.current.a) carRef.current.rotation.y += turnSpeed;
      if (keys.current.d) carRef.current.rotation.y -= turnSpeed;

      const forward = new THREE.Vector3(0, 0, -1);
      forward.applyQuaternion(carRef.current.quaternion);
      carRef.current.position.addScaledVector(forward, velocity.current);
    }

    if (thirdMode && carRef.current) {
      const carPos = carRef.current.position;
      const offset = new THREE.Vector3(0, 1.2, 2.5);
      offset.applyAxisAngle(
        new THREE.Vector3(0, 1, 0),
        carRef.current.rotation.y
      );
      const desiredPosition = carPos.clone().add(offset);
      camera.position.lerp(desiredPosition, 0.08);
      camera.lookAt(carPos);
    }
  });

  return (
    <>
      <group ref={carRef} position={[0, 0.04, 0]}>
        <CarModel />
      </group>
      {!thirdMode && <OrbitControls />}
    </>
  );
};

export default Car;
