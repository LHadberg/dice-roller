// src/components/configuration/PhysicsConfig.tsx
import React from 'react';
import { Slider, Stack, Text } from '@mantine/core';
import { DiceBoxConfig } from '../../types/types';

interface PhysicsConfigProps {
  config: DiceBoxConfig;
  onUpdate: (config: DiceBoxConfig) => void;
}

const PhysicsConfig: React.FC<PhysicsConfigProps> = ({ config, onUpdate }) => {
  const handleUpdate = (key: keyof DiceBoxConfig, value: number) => {
    onUpdate({
      ...config,
      [key]: value,
    });
  };

  return (
    <Stack gap="md">
      {/* TODO Parametize labels for localization */}
      <Text size="xl" fw={700}>
        Physics Configuration
      </Text>
      <Stack gap="xs">
        <Text>Gravity</Text>
        <Slider
          value={config.gravity}
          onChange={(value) => handleUpdate('gravity', value)}
          min={0}
          max={2}
          step={0.1}
          marks={[
            { value: 0, label: '0' },
            { value: 1, label: '1' },
            { value: 2, label: '2' },
          ]}
        />
      </Stack>
      <Stack gap="xs">
        <Text>Mass</Text>
        <Slider
          value={config.mass}
          onChange={(value) => handleUpdate('mass', value)}
          min={0.1}
          max={2}
          step={0.1}
          marks={[
            { value: 0.1, label: 'Light' },
            { value: 1, label: 'Normal' },
            { value: 2, label: 'Heavy' },
          ]}
        />
      </Stack>
      <Stack gap="xs">
        <Text>Friction</Text>
        <Slider
          value={config.friction}
          onChange={(value) => handleUpdate('friction', value)}
          min={0}
          max={1}
          step={0.1}
          marks={[
            { value: 0, label: 'None' },
            { value: 0.5, label: 'Medium' },
            { value: 1, label: 'High' },
          ]}
        />
      </Stack>
    </Stack>
  );
};

export default PhysicsConfig;