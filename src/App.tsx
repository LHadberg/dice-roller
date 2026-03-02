import * as THREE from 'three';

import { Html, PerspectiveCamera } from '@react-three/drei';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useSpring, animated } from '@react-spring/three';
import { Canvas, useLoader, useThree } from '@react-three/fiber';

import './App.css';
import { Configuration } from './components/configuration/Configuration';
import { useLocalStorageConfiguration } from './hooks/useLocalStorageConfiguration';
import { defaultConfigs } from './constants/defaultConfiguration';
import { MantineProvider } from '@mantine/core';
import DiceBoxComponent from './components/DiceBox';

interface DiceBoxContainerProps {
	onClick: () => void;
	configuration: ReturnType<typeof useLocalStorageConfiguration>;
}

const Thing: React.FC<DiceBoxContainerProps> = ({ configuration }) => {
	console.log('Thing Rendering');
	const ref = useRef();
	const {
		viewport: { width: viewportWidth, height: viewportHeight },
		size,
	} = useThree();
	const { wallColor, backgroundColor, backgroundStyle } = configuration.visualConfig;
	const wallThickness = 0.5;

	const wallMesh = useLoader(THREE.TextureLoader, '/src/assets/textures/wall/geometric.svg');
	const backgroundMeshDiamond     = useLoader(THREE.TextureLoader, '/src/assets/textures/background/diamond.svg');
	const backgroundMeshHerringbone = useLoader(THREE.TextureLoader, '/src/assets/textures/background/herringbone.svg');
	const backgroundMesh = backgroundStyle === 'herringbone' ? backgroundMeshHerringbone : backgroundMeshDiamond;

	// Clone so horizontal and vertical walls get independent repeat values (useLoader caches by URL,
	// so loading the same path twice returns the same object — cloning avoids the conflict).
	const [wallMeshHorizontal, wallMeshVertical] = useMemo(() => {
		const h = wallMesh.clone();
		const v = wallMesh.clone();
		h.needsUpdate = true;
		v.needsUpdate = true;
		return [h, v];
	}, [wallMesh]);

	useEffect(() => {
		// 1 world-unit per tile keeps every surface at the same texel density.
		if (wallMeshHorizontal) {
			wallMeshHorizontal.wrapS = wallMeshHorizontal.wrapT = THREE.RepeatWrapping;
			wallMeshHorizontal.repeat.set(viewportWidth, wallThickness);
			wallMeshHorizontal.needsUpdate = true;
		}

		if (wallMeshVertical) {
			wallMeshVertical.wrapS = wallMeshVertical.wrapT = THREE.RepeatWrapping;
			wallMeshVertical.repeat.set(wallThickness, viewportHeight);
			wallMeshVertical.needsUpdate = true;
		}

		for (const bg of [backgroundMeshDiamond, backgroundMeshHerringbone]) {
			bg.wrapS = bg.wrapT = THREE.RepeatWrapping;
			bg.repeat.set(viewportWidth, viewportHeight);
			bg.needsUpdate = true;
		}
	}, [wallMeshHorizontal, wallMeshVertical, backgroundMeshDiamond, backgroundMeshHerringbone, viewportHeight, viewportWidth]);

	const wallMetalness = 0.2;
	const wallRoughness = 0.5;

	return (
		// <group onClick={onClick}>
		<group>
			{/* Top Wall */}
			<mesh position={[0, (viewportHeight - wallThickness) / 2, 0.5]}>
				<boxGeometry attach='geometry' args={[viewportWidth, 0.5, wallThickness]} />
				<meshStandardMaterial map={wallMeshHorizontal} color={wallColor} metalness={wallMetalness} roughness={wallRoughness} />
			</mesh>
			{/* Left Wall */}
			<mesh position={[-(viewportWidth - wallThickness) / 2, 0, 0.5]}>
				<boxGeometry attach='geometry' args={[0.5, viewportHeight, wallThickness]} />
				<meshStandardMaterial map={wallMeshVertical} color={wallColor} metalness={wallMetalness} roughness={wallRoughness} />
			</mesh>
			{/* Right Wall */}
			<mesh position={[(viewportWidth - wallThickness) / 2, 0, 0.5]}>
				<boxGeometry attach='geometry' args={[0.5, viewportHeight, wallThickness]} />
				<meshStandardMaterial map={wallMeshVertical} color={wallColor} metalness={wallMetalness} roughness={wallRoughness} />
			</mesh>
			{/* Bottom Wall */}
			<mesh position={[0, -(viewportHeight - wallThickness) / 2, 0.5]}>
				<boxGeometry attach='geometry' args={[viewportWidth, 0.5, wallThickness]} />
				<meshStandardMaterial map={wallMeshHorizontal} color={wallColor} metalness={wallMetalness} roughness={wallRoughness} />
			</mesh>
			{/* Background */}
			<mesh ref={ref as any} scale={[viewportWidth, viewportHeight, 1]}>
				<boxGeometry attach='geometry' args={[1, 1, 0.1]} />
				<meshStandardMaterial map={backgroundMesh} color={backgroundColor} roughness={0.7} metalness={0.8} />
			</mesh>
		</group>
	);
};

interface DiceAppProps {
	configuration: ReturnType<typeof useLocalStorageConfiguration>;
}

export const DiceApp: React.FC<DiceAppProps> = ({ configuration }) => {
	console.log('Dice-App Rendering');
	const { size, viewport } = useThree();
	console.debug('🚀 ~ Diceapp ~ size:', size);

	const [isRotated, setIsRotated] = useState(false);
	const [isZoomedOut, setIsZoomedOut] = useState(false);
	const [showDiceBox, setShowDiceBox] = useState(true);
	const [showConfiguration, setShowConfiguration] = useState(false);
	const [diceBoxMounted, setDiceBoxMounted] = useState(false);

	// Create a spring animation from 0 to 180 degrees
	const { rotation } = useSpring({
		rotation: isRotated ? Math.PI : 0,
		config: {
			mass: 1,
			tension: 50,
			friction: 10,
			precision: 0.001,
		},
		onStart: () => {
			setIsZoomedOut(true);
		},
		onResolve: () => {
			setIsZoomedOut(false);
		},
		// onChange: (a, b, c) => {
		// 	console.log(a, b, c)
		// },
	});

	const { position } = useSpring({
		position: isZoomedOut ? 5 : 0,
		config: {
			mass: 1,
			tension: 100,
			friction: 15,
			precision: 0.001,
		},
	});

	useEffect(() => {
		// Set a timeout to ensure the DiceBox mounts after the 3D environment is ready
		const timer = setTimeout(() => {
			setDiceBoxMounted(true);
		}, 500);

		return () => clearTimeout(timer);
	}, []);

	const toggleCamera = () => {
		setIsRotated(!isRotated);

		// Add a small delay before toggling the components to allow for animation
		setTimeout(() => {
			setShowDiceBox(!showDiceBox);
			setShowConfiguration(!showConfiguration);
		}, 300);
	};

	// True only once the flip animation has fully settled on the config side
	const configSlide = isRotated && !isZoomedOut;

	// Dynamically compute distanceFactor so the HTML overlay always fills the 3D camera viewport.
	// From the drei Html source, screen height = div_h × (htmlScale × df/400) × (fov_css / (camZ - objZ))
	// where fov_css = projectionMatrix[5] × heightHalf = (camZ × 2 / viewport.height) × (size.height / 2).
	// Setting screen_h = size.height and solving for df:
	//   df = 400 × (camZ - objZ) × viewport.height / (htmlScale × camZ × size.height)
	// distanceFactor is INVERSELY proportional to size.height.
	const htmlScale = 0.4;
	const cameraZ = 10;
	const frontHtmlZ = 0.2;
	const dynamicDistanceFactor = 400 * (cameraZ - frontHtmlZ) * viewport.height / (htmlScale * cameraZ * size.height);

	const toggleShowDiceBox = (value?: React.SetStateAction<boolean> | undefined) => {
		const newValue = value !== undefined ?
			(typeof value === 'function' ? (value as Function)(showDiceBox) : value) :
			!showDiceBox;

		// If we're currently on the DiceBox side, trigger the camera rotation
		if (!isRotated) {
			toggleCamera();
		} else {
			// If we're on the configuration side already, just update the state
			setShowDiceBox(newValue);
			setShowConfiguration(!newValue);
		}
	};

	return (
		<>
			<animated.group rotation-y={rotation}>
				<animated.group position-z={position}>
					<PerspectiveCamera makeDefault position={[0, 0, 10]} lookAt={() => [0, 0, 10]} />
				</animated.group>
			</animated.group>
			<Thing
				onClick={toggleCamera}
				configuration={configuration}
			/>

			<ambientLight />
			<pointLight position={[7, 7, 9]} intensity={0.8} />

			{/* DiceBox Component (frontside) */}
			{showDiceBox && diceBoxMounted && !isRotated && (
				<Html transform occlude distanceFactor={dynamicDistanceFactor} scale={[0.4, 0.4, 1]} rotation={[0, 0, 0]} position={[0, 0, 0.2]}>
					<div
						style={{
							width: size.width,
							height: size.height,
							padding: '0',
						}}
					>
						<MantineProvider defaultColorScheme='auto'>
							<DiceBoxComponent
								configuration={configuration}
								toggleShowDiceBox={toggleShowDiceBox}
							/>
						</MantineProvider>
					</div>
				</Html>
			)}

			{/* Configuration Panel (backside) */}
			{showConfiguration && (
				<Html transform occlude distanceFactor={dynamicDistanceFactor} scale={[0.4, 0.4, 1]} rotation={[0, Math.PI, 0]} position={[0, 0, -0.1]}>
					<div style={{ width: size.width, height: size.height, overflow: 'hidden' }}>
						<div
							style={{
								width: '100%',
								height: '100%',
								transform: configSlide ? 'translateX(0)' : 'translateX(100%)',
								transition: configSlide ? 'transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)' : 'none',
							}}
						>
							<MantineProvider defaultColorScheme='auto'>
								<Configuration toggleShowDiceBox={toggleCamera} configuration={configuration} />
							</MantineProvider>
						</div>
					</div>
				</Html>
			)}
		</>
	);
};

export const DiceAppWrapper = () => {
	const configuration = useLocalStorageConfiguration(defaultConfigs);

	return (
		<Canvas>
			<DiceApp configuration={configuration} />
		</Canvas>
	);
};
