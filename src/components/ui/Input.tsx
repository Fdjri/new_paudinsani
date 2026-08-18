import * as React from 'react'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helperText?: string
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', label, error, helperText, id, ...props }, ref) => {
    // Generate an ID if one isn't provided, useful for linking label and input
    const inputId = id || React.useId()

    // Base input styles
    const baseInputStyles =
      'w-full border rounded-[14px] px-4 py-3 transition-colors focus:outline-none focus:ring-1 h-11 shadow-sm disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed'
    
    // Dynamic styles based on state
    const defaultInputStyles = 'border-border/60 bg-card text-foreground focus:ring-primary focus:border-primary'
    const errorInputStyles = 'border-destructive bg-destructive/10 focus:ring-destructive/30 focus:border-destructive text-destructive'

    const inputClasses = `${baseInputStyles} ${error ? errorInputStyles : defaultInputStyles} ${className}`

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium text-foreground mb-1.5">
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        <input ref={ref} id={inputId} className={inputClasses} {...props} />
        {error && (
          <p className="mt-1.5 text-sm text-destructive font-medium">{error}</p>
        )}
        {helperText && !error && (
          <p className="mt-1.5 text-sm text-muted-foreground">{helperText}</p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'
