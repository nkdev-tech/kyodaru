import Svg, { Circle, Path } from 'react-native-svg';

const LEVEL_COLORS: Record<number, string> = {
  1: '#F2A65A',
  2: '#F2D06B',
  3: '#B8D8A8',
  4: '#8FC1E3',
  5: '#A6AEDC',
};

export const LEVEL_LABELS: Record<number, string> = {
  1: 'とても良い',
  2: 'まぁまぁ良い',
  3: '普通',
  4: 'まぁまぁ悪い',
  5: 'とても悪い',
};

type FaceShape = {
  eyes: [string, string];
  mouth: string;
  fill?: boolean;
  tear?: boolean;
};

const SHAPES: Record<number, FaceShape> = {
  1: {
    eyes: ['M8 13 Q11 10 14 13', 'M18 13 Q21 10 24 13'],
    mouth: 'M11 18 Q16 25 21 18',
    fill: true,
  },
  2: {
    eyes: ['M8 12 Q11 15 14 12', 'M18 12 Q21 15 24 12'],
    mouth: 'M12 19 Q16 23 20 19',
  },
  3: {
    eyes: ['M9 13 H13', 'M19 13 H23'],
    mouth: 'M13 20 H19',
  },
  4: {
    eyes: ['M9 12 Q11 15 13 12', 'M19 12 Q21 15 23 12'],
    mouth: 'M13 20 Q16 18.5 19 20',
  },
  5: {
    eyes: ['M8 11 Q11 15 14 11', 'M18 11 Q21 15 24 11'],
    mouth: 'M12 22 Q16 18 20 22',
    tear: true,
  },
};

const STROKE = '#36444F';

type Props = {
  level: number;
  size?: number;
};

export function Face({ level, size = 24 }: Props) {
  const shape = SHAPES[level] ?? SHAPES[3];
  const color = LEVEL_COLORS[level] ?? LEVEL_COLORS[3];
  return (
    <Svg width={size} height={size} viewBox="0 0 32 32" accessibilityLabel={`体調レベル${level}`}>
      <Circle cx={16} cy={16} r={15} fill={color} />
      <Path d={shape.eyes[0]} stroke={STROKE} strokeWidth={2.2} strokeLinecap="round" fill="none" />
      <Path d={shape.eyes[1]} stroke={STROKE} strokeWidth={2.2} strokeLinecap="round" fill="none" />
      {shape.fill ? (
        <Path d={`${shape.mouth} Z`} fill={STROKE} />
      ) : (
        <Path d={shape.mouth} stroke={STROKE} strokeWidth={2.2} strokeLinecap="round" fill="none" />
      )}
      {shape.tear && (
        <Path
          d="M24 14 C24 16.2 22.4 16.8 22.4 18.2 C22.4 19.3 25.6 19.3 25.6 18.2 C25.6 16.8 24 16.2 24 14 Z"
          fill="#6E9FC9"
        />
      )}
    </Svg>
  );
}
