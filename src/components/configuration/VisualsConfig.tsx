// src/components/configuration/VisualsConfig.tsx
import React from 'react';
import { ColorInput, Select, SegmentedControl, Stack, Text, useMantineColorScheme } from '@mantine/core';
import { VisualConfig } from '../../types/types';

interface VisualsConfigProps {
  config: VisualConfig;
  onUpdate: (config: VisualConfig) => void;
}

const VisualsConfig: React.FC<VisualsConfigProps> = ({ config, onUpdate }) => {
  const { colorScheme, setColorScheme } = useMantineColorScheme();

  {/* TODO: Add localization */ }
  const themes = [
    { value: 'default', label: 'Default' },
    { value: 'rust', label: 'Rust' },
    { value: 'diceOfRolling', label: 'Dice of Rolling' },
    { value: 'gemstone', label: 'Gemstone' }
  ];

  return (
    <Stack gap="md">
      <div>
        <Text size="sm" fw={500} mb={4}>UI Theme</Text>
        <SegmentedControl
          fullWidth
          value={colorScheme}
          onChange={(value) => setColorScheme(value as 'light' | 'dark' | 'auto')}
          data={[
            { value: 'light', label: 'Light' },
            { value: 'dark', label: 'Dark' },
            { value: 'auto', label: 'Auto' },
          ]}
        />
      </div>

      <Text size="xl" fw={700}>
        {/* TODO: Add localization */}
        Visual Configuration
      </Text>
      <Select
        label="Theme"
        description="Choose from available dice themes"
        data={themes}
        value={config.theme}
        onChange={(value) => onUpdate({ ...config, theme: value ?? 'default' })}
        comboboxProps={{ withinPortal: false }}
      />
      <ColorInput
        label="Theme Color"
        description="Custom color for the dice theme"
        value={config.themeColor}
        onChange={(value) => onUpdate({ ...config, themeColor: value })}
      />
    </Stack>
  );
};

export default VisualsConfig;
