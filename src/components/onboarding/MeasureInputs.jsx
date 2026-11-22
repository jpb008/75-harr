import { NumberInput } from '../ui'

const LB_PER_KG = 2.20462

function round1(n) {
  return Math.round(n * 10) / 10
}

export function WeightInput({ valueKg, units, onChange, placeholder }) {
  if (units === 'metric') {
    return <NumberInput value={valueKg} onChange={onChange} min={25} max={350} step={0.1} suffix="kg" placeholder={placeholder} />
  }
  const lb = valueKg == null ? null : round1(valueKg * LB_PER_KG)
  return (
    <NumberInput
      value={lb}
      onChange={(v) => onChange(v == null ? null : round1(v / LB_PER_KG))}
      min={50}
      max={800}
      step={0.1}
      suffix="lb"
      placeholder={placeholder}
    />
  )
}

export function HeightInput({ valueCm, units, onChange }) {
  if (units === 'metric') {
    return <NumberInput value={valueCm} onChange={onChange} min={100} max={250} suffix="cm" />
  }
  const totalInches = valueCm == null ? null : Math.round(valueCm / 2.54)
  const feet = totalInches == null ? null : Math.floor(totalInches / 12)
  const inches = totalInches == null ? null : totalInches % 12
  function emit(nextFeet, nextInches) {
    if (nextFeet == null && nextInches == null) return onChange(null)
    onChange(round1(((nextFeet ?? 0) * 12 + (nextInches ?? 0)) * 2.54))
  }
  return (
    <div className="grid grid-cols-2 gap-2">
      <NumberInput value={feet} onChange={(v) => emit(v, inches)} min={3} max={8} suffix="ft" />
      <NumberInput value={inches} onChange={(v) => emit(feet, v)} min={0} max={11} suffix="in" />
    </div>
  )
}

export function formatWeight(kg, units) {
  if (kg == null) return '—'
  return units === 'metric' ? `${round1(kg)} kg` : `${Math.round(kg * LB_PER_KG)} lb`
}
