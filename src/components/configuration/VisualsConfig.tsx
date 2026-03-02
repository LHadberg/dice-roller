// src/components/configuration/VisualsConfig.tsx
import React, { useMemo } from 'react';
import { ActionIcon, ColorInput, Group, SegmentedControl, Stack, Text, Tooltip, useMantineColorScheme } from '@mantine/core';
import { IconRefresh } from '@tabler/icons-react';
import { VisualConfig } from '../../types/types';
import { defaultConfigs } from '../../constants/defaultConfiguration';
import { useTranslation } from 'react-i18next';
import wallSvgRaw from '../../assets/textures/wall/geometric.svg?raw';
import diamondSvgRaw from '../../assets/textures/background/diamond.svg?raw';
import herringboneSvgRaw from '../../assets/textures/background/herringbone.svg?raw';

const { defaultVisualConfig } = defaultConfigs;

// Base colors of each SVG — the mid-tone around which the rest of the palette is built.
const WALL_SVG_BASE = '#c49050';

const BACKGROUND_STYLES: Record<string, { svgRaw: string; baseColor: string; label: string; tileW: number; tileH: number }> = {
  diamond:     { svgRaw: diamondSvgRaw,     baseColor: '#a07848', label: 'Diamond',     tileW: 64, tileH: 64 },
  herringbone: { svgRaw: herringboneSvgRaw, baseColor: '#c49050', label: 'Herringbone', tileW: 48, tileH: 64 },
};

function hexToHsl(hex: string): [number, number, number] {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return [0, 0, l];
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h = 0;
  if (max === r) h = (g - b) / d + (g < b ? 6 : 0);
  else if (max === g) h = (b - r) / d + 2;
  else h = (r - g) / d + 4;
  return [h * 60, s, l];
}

function hslToHex(h: number, s: number, l: number): string {
  h = ((h % 360) + 360) % 360;
  s = Math.max(0, Math.min(1, s));
  l = Math.max(0, Math.min(1, l));
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    return Math.round(255 * (l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1)))
      .toString(16).padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

// Replace every hex color in the SVG with a proportionally adjusted variant of chosenHex,
// preserving the light/dark depth of the original pattern.
function recolorSvg(svgRaw: string, chosenHex: string, baseHex: string): string {
  const [ch, cs, cl] = hexToHsl(chosenHex);
  const [, bs, bl] = hexToHsl(baseHex);
  return svgRaw.replace(/#[0-9a-fA-F]{6}/g, (original) => {
    const [, os, ol] = hexToHsl(original);
    const newS = Math.max(0, Math.min(1, cs * (bs > 0 ? os / bs : 1)));
    const newL = Math.max(0, Math.min(1, cl * (bl > 0 ? ol / bl : 1)));
    return hslToHex(ch, newS, newL);
  });
}

const TexturePreview: React.FC<{ svgRaw: string; color: string; baseColor: string; tileW: number; tileH: number }> = ({ svgRaw, color, baseColor, tileW, tileH }) => {
  const dataUrl = useMemo(() => {
    const svg = /^#[0-9a-fA-F]{6}$/.test(color) ? recolorSvg(svgRaw, color, baseColor) : svgRaw;
    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  }, [svgRaw, color, baseColor]);

  return (
    <div style={{
      width: '100%',
      height: 64,
      borderRadius: 6,
      backgroundImage: `url("${dataUrl}")`,
      backgroundRepeat: 'repeat',
      backgroundSize: `${tileW}px ${tileH}px`,
    }} />
  );
};

interface VisualsConfigProps {
  config: VisualConfig;
  onUpdate: (config: VisualConfig) => void;
}

const VisualsConfig: React.FC<VisualsConfigProps> = ({ config, onUpdate }) => {
  const { colorScheme, setColorScheme } = useMantineColorScheme();
  const { t } = useTranslation();

  return (
    <Stack gap="md">
      <div>
        <Text size="sm" fw={500} mb={4}>{t('visuals.uiTheme')}</Text>
        <SegmentedControl
          fullWidth
          value={colorScheme}
          onChange={(value) => setColorScheme(value as 'light' | 'dark' | 'auto')}
          data={[
            { value: 'light', label: t('visuals.light') },
            { value: 'dark', label: t('visuals.dark') },
            { value: 'auto', label: t('visuals.auto') },
          ]}
        />
      </div>

      <Text size="xl" fw={700}>
        {t('visuals.title')}
      </Text>
      <Group align="flex-end" gap="xs">
        <ColorInput
          style={{ flex: 1 }}
          label={t('visuals.diceColor')}
          description={t('visuals.diceColorDescription')}
          value={config.themeColor}
          onChange={(value) => onUpdate({ ...config, themeColor: value })}
          popoverProps={{ withinPortal: false }}
        />
        <Tooltip label={t('visuals.resetToDefault')} withinPortal={false}>
          <ActionIcon variant="default" size={36} onClick={() => onUpdate({ ...config, themeColor: defaultVisualConfig.themeColor })}>
            <IconRefresh size={16} />
          </ActionIcon>
        </Tooltip>
      </Group>
      <Group align="flex-end" gap="xs">
        <ColorInput
          style={{ flex: 1 }}
          label={t('visuals.wallColor')}
          description={t('visuals.wallColorDescription')}
          value={config.wallColor}
          onChange={(value) => onUpdate({ ...config, wallColor: value })}
          popoverProps={{ withinPortal: false }}
        />
        <Tooltip label={t('visuals.resetToDefault')} withinPortal={false}>
          <ActionIcon variant="default" size={36} onClick={() => onUpdate({ ...config, wallColor: defaultVisualConfig.wallColor })}>
            <IconRefresh size={16} />
          </ActionIcon>
        </Tooltip>
      </Group>
      <TexturePreview svgRaw={wallSvgRaw} color={config.wallColor} baseColor={WALL_SVG_BASE} tileW={64} tileH={64} />
      <div>
        <Text size="sm" fw={500} mb={4}>{t('visuals.backgroundStyle')}</Text>
        <SegmentedControl
          fullWidth
          value={config.backgroundStyle}
          onChange={(value) => onUpdate({ ...config, backgroundStyle: value })}
          data={Object.entries(BACKGROUND_STYLES).map(([value, { label }]) => ({ value, label }))}
        />
      </div>
      <Group align="flex-end" gap="xs">
        <ColorInput
          style={{ flex: 1 }}
          label={t('visuals.backgroundColor')}
          description={t('visuals.backgroundColorDescription')}
          value={config.backgroundColor}
          onChange={(value) => onUpdate({ ...config, backgroundColor: value })}
          popoverProps={{ withinPortal: false }}
        />
        <Tooltip label={t('visuals.resetToDefault')} withinPortal={false}>
          <ActionIcon variant="default" size={36} onClick={() => onUpdate({ ...config, backgroundColor: defaultVisualConfig.backgroundColor })}>
            <IconRefresh size={16} />
          </ActionIcon>
        </Tooltip>
      </Group>
      {(() => {
        const style = BACKGROUND_STYLES[config.backgroundStyle] ?? BACKGROUND_STYLES.diamond;
        return <TexturePreview svgRaw={style.svgRaw} color={config.backgroundColor} baseColor={style.baseColor} tileW={style.tileW} tileH={style.tileH} />;
      })()}
    </Stack>
  );
};

export default VisualsConfig;
