"use client"

interface AudioWaveProps {
  visualization: number[]
}

export default function AudioWave({ visualization }: AudioWaveProps) {
  return (
    <div className="flex items-center justify-center h-16 space-x-1">
      {visualization.map((height, index) => (
        <div
          key={index}
          className="w-1 bg-indigo-500 rounded-full transition-all duration-100"
          style={{ height: `${height}px` }}
        ></div>
      ))}
    </div>
  )
}
