import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import { Canvas } from "@react-three/fiber";

import {
  useGLTF,
  useAnimations,
} from "@react-three/drei";

import * as THREE from "three";

import "./Login.css";


/* =====================================================
   3D MODEL
   Form opens only after the 3D animation finishes.
===================================================== */

function MikuModel({ onAnimationComplete }) {
  const modelRef = useRef(null);

  const {
    scene,
    animations,
  } = useGLTF("/models/scene/scene.gltf");

  const { actions, mixer } = useAnimations(
    animations,
    modelRef
  );


  useEffect(() => {
    if (!actions || !mixer) return;

    const actionList = Object.values(actions).filter(Boolean);

    console.log("3D Animations:", actionList.length);

    // If the GLTF has no animation, show the form immediately.
    if (actionList.length === 0) {
      onAnimationComplete();
      return;
    }

    let finishedCount = 0;

    const handleFinished = (event) => {
      // Ignore events from actions that are not part of our list.
      if (!actionList.includes(event.action)) return;

      finishedCount += 1;

      // First animation cycle is complete.
      if (finishedCount >= actionList.length) {

        // Show the form only now.
        onAnimationComplete();

        /*
          IMPORTANT:
          Do NOT stop the Miku animation.

          After the first cycle finishes, switch every
          animation to infinite loop and start it again.
          So the model keeps moving behind the form.
        */

        actionList.forEach((action) => {

          action.reset();

          action.setLoop(
            THREE.LoopRepeat,
            Infinity
          );

          action.clampWhenFinished = false;

          action.fadeIn(0.15);

          action.play();

        });
      }
    };

    mixer.addEventListener("finished", handleFinished);

    actionList.forEach((action) => {
      action.reset();
      action.setLoop(THREE.LoopOnce, 1);
      action.clampWhenFinished = true;
      action.fadeIn(0.15);
      action.play();
    });

    return () => {
      mixer.removeEventListener("finished", handleFinished);

      actionList.forEach((action) => {
        action.stop();
      });
    };
  }, [actions, mixer, onAnimationComplete]);


  return (
    <group
      ref={modelRef}
      scale={0.85}
      position={[0, -0.35, 0]}
    >
      <primitive object={scene} />
    </group>
  );
}


/* =====================================================
   LOGIN
===================================================== */

function Login() {
  const [showForm, setShowForm] = useState(false);
  const [success, setSuccess] = useState(false);


  const handleAnimationComplete = useCallback(() => {
    setShowForm(true);
  }, []);


  /* ================================================
     SUCCESS MESSAGE
  ================================================= */

  const handleSignup = (event) => {
    event.preventDefault();

    setSuccess(true);

    setTimeout(() => {
      setSuccess(false);
    }, 3000);
  };


  return (
    <div className="login-page">

      {/* ==========================================
          3D MODEL

          Form will NOT appear until animation ends.
      ========================================== */}

      <div className="model-container">
        <Canvas
          camera={{
            position: [0, 0, 6],
            fov: 45,
          }}
          dpr={[1, 2]}
        >
          <ambientLight intensity={2.5} />

          <directionalLight
            position={[4, 6, 5]}
            intensity={3}
          />

          <directionalLight
            position={[-4, 3, 4]}
            intensity={2}
          />

          <pointLight
            position={[0, 2, 3]}
            intensity={1.5}
          />

          <MikuModel
            onAnimationComplete={handleAnimationComplete}
          />
        </Canvas>
      </div>


      {/* ==========================================
          FORM

          Hidden initially.
          Appears only after 3D animation finishes.
      ========================================== */}

      <div
        className={`login-overlay ${showForm ? "show" : ""}`}
      >
        <form
          className="login-card"
          onSubmit={handleSignup}
        >
          <h1>Register Now</h1>

          <div className="input-group">
            <label>Email</label>

            <input
              type="email"
              placeholder="Enter your Email"
              required
            />
          </div>

          <div className="input-group">
            <label>Password</label>

            <input
              type="password"
              placeholder="Enter your Password"
              required
            />
          </div>

          <button type="submit">
            Signup Now
          </button>
        </form>
      </div>


      {/* ==========================================
          SUCCESS POPUP
      ========================================== */}

      {success && (
        <div className="success-message">
          <div className="success-icon">
            ✓
          </div>

          <div className="success-text">
            <strong>Login Successful!</strong>
            <span>Welcome back</span>
          </div>
        </div>
      )}

    </div>
  );
}


useGLTF.preload(
  "/models/scene/scene.gltf"
);


export default Login;
