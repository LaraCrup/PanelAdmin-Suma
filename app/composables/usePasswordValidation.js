export function usePasswordValidation(password) {
  const passwordRules = computed(() => [
    { label: 'Mínimo 8 caracteres',  passes: password.value.length >= 8 },
    { label: 'Una letra mayúscula',  passes: /[A-Z]/.test(password.value) },
    { label: 'Una letra minúscula',  passes: /[a-z]/.test(password.value) },
    { label: 'Un número',            passes: /[0-9]/.test(password.value) },
    { label: 'Un carácter especial', passes: /[^A-Za-z0-9]/.test(password.value) },
  ])

  const passwordValid = computed(() => passwordRules.value.every(r => r.passes))

  return { passwordRules, passwordValid }
}
