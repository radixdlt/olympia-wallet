import { defineRule } from 'vee-validate'
import { required, confirmed, length } from '@vee-validate/rules'

// // Allow any in typespec because this is what is in the vee-validate spec
// // eslint-disable-next-line @typescript-eslint/no-explicit-any
// export const required = (value: any) => {
//   if (!value || !value.length) {
//     return 'This field is required'
//   }

//   return true
// }
// // eslint-disable-next-line @typescript-eslint/no-explicit-any
// export const confirmed = (value: any, [target]: any[], ctx: Record<string, any>) => {
//   if (value === ctx.form[target]) {
//     return true
//   }

//   return 'Passwords must match'
// }

defineRule('required', required)
defineRule('confirmed', confirmed)
defineRule('length', length)
