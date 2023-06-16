import React, { useEffect } from 'react';
import * as THREE from 'three';
import { Canvas } from 'react-three-fiber';
import { MeshPhysicalNodeMaterial, normalWorld, timerLocal, mx_noise_vec3, mx_worley_noise_vec3, mx_cell_noise_float, mx_fractal_noise_vec3 } from 'three/examples/jsm/nodes/Nodes.js';
import Stats from 'three/examples/jsm/libs/stats.module.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { HDRCubeTextureLoader } from 'three/examples/jsm/loaders/HDRCubeTextureLoader.js';

function ThreeMaterialXNoise() {
  useEffect(() => {
    let container, stats;
    let camera, scene, renderer;
    let particleLight;
    let group;

    const init = () => {
      container = document.createElement('div');
      document.body.appendChild(container);

      camera = new THREE.PerspectiveCamera(27, window.innerWidth / window.innerHeight, 1, 10000);
      camera.position.z = 1000;

      scene = new THREE.Scene();

      group = new THREE.Group();
      scene.add(group);

      new HDRCubeTextureLoader()
        .setPath('textures/cube/pisaHDR/')
        .load(
          ['px.hdr', 'nx.hdr', 'py.hdr', 'ny.hdr', 'pz.hdr', 'nz.hdr'],
          function (hdrTexture) {
            const geometry = new THREE.SphereGeometry(80, 64, 32);

            const offsetNode = timerLocal();
            const customUV = normalWorld.mul(10).add(offsetNode);

            let material = new MeshPhysicalNodeMaterial();
            material.colorNode = mx_noise_vec3(customUV);

            let mesh = new THREE.Mesh(geometry, material);
            mesh.position.x = -100;
            mesh.position.y = 100;
            group.add(mesh);

            material = new MeshPhysicalNodeMaterial();
            material.colorNode = mx_cell_noise_float(customUV);

            mesh = new THREE.Mesh(geometry, material);
            mesh.position.x = 100;
            mesh.position.y = 100;
            group.add(mesh);

            material = new MeshPhysicalNodeMaterial();
            material.colorNode = mx_worley_noise_vec3(customUV);

            mesh = new THREE.Mesh(geometry, material);
            mesh.position.x = -100;
            mesh.position.y = -100;
            group.add(mesh);

            material = new MeshPhysicalNodeMaterial();
            material.colorNode = mx_fractal_noise_vec3(customUV.mul(0.2));

            mesh = new THREE.Mesh(geometry, material);
            mesh.position.x = 100;
            mesh.position.y = -100;
            group.add(mesh);

            scene.background = hdrTexture;
            scene.environment = hdrTexture;
          }
        );

      particleLight = new THREE.Mesh(
        new THREE.SphereGeometry(4, 8, 8),
        new THREE.MeshBasicMaterial({ color: 0xffffff })
      );
      scene.add(particleLight);

      particleLight.add(new THREE.PointLight(0xffffff, 1));

      renderer = new THREE.WebGLRenderer();
      renderer.setPixelRatio(window.devicePixelRatio);
      renderer.setSize(window.innerWidth, window.innerHeight);
      container.appendChild(renderer.domElement);

      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.25;

      stats = new Stats();
      container.appendChild(stats.dom);

      new OrbitControls(camera, renderer.domElement);

      window.addEventListener('resize', onWindowResize);
    };

    const onWindowResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;

      camera.aspect = width / height;
      camera.updateProjectionMatrix();

      renderer.setSize(width, height);
    };

    const animate = () => {
      requestAnimationFrame(animate);
      render();
      stats.update();
    };

    const render = () => {
      const timer = Date.now() * 0.00025;

      particleLight.position.x = Math.sin(timer * 7) * 300;
      particleLight.position.y = Math.cos(timer * 5) * 400;
      particleLight.position.z = Math.cos(timer * 3) * 300;

      for (let i = 0; i < group.children.length; i++) {
        const child = group.children[i];
        child.rotation.y += 0.005;
      }

      renderer.render(scene, camera);
    };

    init();
    animate();

    // Clean up the scene on unmount
    return () => {
      container.removeChild(renderer.domElement);
      renderer.dispose();
      scene.dispose();
      stats.dom.remove();
      window.removeEventListener('resize', onWindowResize);
    };
  }, []);

  return <div id="container" />;
}

export default ThreeMaterialXNoise;
