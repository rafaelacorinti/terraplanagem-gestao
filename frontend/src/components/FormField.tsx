import { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react'

interface BaseProps {
  label: string
  error?: string
}

interface InputProps extends BaseProps, InputHTMLAttributes<HTMLInputElement> {
  fieldType?: 'input'
}

interface SelectProps extends BaseProps, SelectHTMLAttributes<HTMLSelectElement> {
  fieldType: 'select'
  options: { value: string; label: string }[]
}

interface TextareaProps extends BaseProps, TextareaHTMLAttributes<HTMLTextAreaElement> {
  fieldType: 'textarea'
}

type FormFieldProps = InputProps | SelectProps | TextareaProps

export default function FormField(props: FormFieldProps) {
  const { label, error, fieldType = 'input', ...rest } = props

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      {fieldType === 'select' ? (
        <select
          className={`select-field ${error ? 'border-red-500 focus:ring-red-500' : ''}`}
          {...(rest as SelectHTMLAttributes<HTMLSelectElement>)}
        >
          <option value="">Selecione...</option>
          {(props as SelectProps).options.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      ) : fieldType === 'textarea' ? (
        <textarea
          className={`input-field ${error ? 'border-red-500 focus:ring-red-500' : ''}`}
          rows={3}
          {...(rest as TextareaHTMLAttributes<HTMLTextAreaElement>)}
        />
      ) : (
        <input
          className={`input-field ${error ? 'border-red-500 focus:ring-red-500' : ''}`}
          {...(rest as InputHTMLAttributes<HTMLInputElement>)}
        />
      )}
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  )
}
