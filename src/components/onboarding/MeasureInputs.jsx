import { useState } from 'react'
import { NumberInput } from '../ui'

const LB_PER_KG = 2.20462

function round(n, places) {
  const f = 10 ** places
  return Math.round(n * f) / f
}

// Stored in kg at full precision so converting back to pounds always shows
// exactly what the user typed (rounding the kg value made "185" collapse
// to "1.1" mid-typing).
export function WeightInput({ valueKg, units, onChange, placeholder }) {
  if (units === 'metric') {
    return (
      <NumberInput
        value={valueKg == null ? null : round(valueKg, 1)}
        onChange={onChange}
        min={25}
        max={350}
        step={0.1}
        suffix="kg"
        placeholder={placeholder}
      />
    )
  }
  return (
    <NumberInput
      value={valueKg == null ? null : round(valueKg * LB_PER_KG, 1)}
      onChange={(lb) => onChange(lb == null ? null : round(lb / LB_PER_KG, 4))}
      min={50}
      max={800}
      step={0.1}
      suffix="lb"
      placeholder={placeholder}
    />
  )
}

function splitFeetInches(cm) {
  if (cm == null) return { feet: null, inches: null }
  const total = Math.round(cm / 2.54)
  return { feet: Math.floor(total / 12), inches: total % 12 }
}

// Feet and inches are kept as typed, so filling in one box never puts a
// surprise "0" in the other one.
export function HeightInput({ valueCm, units, onChange }) {
  const [parts, setParts] = useState(() => splitFeetInches(valueCm))

  if (units === 'metric') {
    return (
      <NumberInput
        value={valueCm == null ? null : round(valueCm, 1)}
        onChange={(cm) => {
          onChange(cm)
          setParts(splitFeetInches(cm))
        }}
        min={100}
        max={250}
        suffix="cm"
      />
    )
  }

  function update(next) {
    setParts(next)
    if (next.feet == null && next.inches == null) onChange(null)
    else onChange(round(((next.feet ?? 0) * 12 + (next.inches ?? 0)) * 2.54, 2))
  }

  return (
    <div className="grid grid-cols-2 gap-2">
      <NumberInput value={parts.feet} onChange={(feet) => update({ ...parts, feet })} min={3} max={8} suffix="ft" />
      <NumberInput value={parts.inches} onChange={(inches) => update({ ...parts, inches })} min={0} max={11} suffix="in" />
    </div>
  )
}
