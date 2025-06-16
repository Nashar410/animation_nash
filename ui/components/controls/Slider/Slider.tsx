// ui/components/controls/Slider/Slider.tsx
interface SliderProps {
    min: number;
    max: number;
    value: number;
    onChange: (value: number) => void;
    step?: number;
}

export function Slider({ min, max, value, onChange, step = 1 }: SliderProps) {
    return (
        <input
            type="range"
            min={min}
            max={max}
            value={value}
            onChange={(e) => onChange(Number(e.target.value))}
            step={step}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
        />
    );
}