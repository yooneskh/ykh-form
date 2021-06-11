<template>
  <v-form class="y-form y-form-vuetify" @submit.prevent>
    <v-row dense>
      <v-col v-for="field in filteredValidatedFields" :key="field.key" :cols="field.preemptWidth ? field.width || 12 : 12" :md="field.width || 12" :class="{ 'pb-0': noBottomPadding }" style="position: relative;">
        <component
          :is="mapElementType(field)"
          ref="fieldElements"
          :target="target"
          :field="field"
          :value="(field.getter && field.getter(target, targetIndex)) || (field.key && target[field.key])"
          @input="handleInput(field, ...arguments)"
          @update:valid="$set(validations, field.key, $event)"
          @update:key="$emit('update:key', arguments[0], arguments[1])"
        />
      </v-col>
    </v-row>
  </v-form>
</template>

<script>

import { conforms } from '../util/validation';
import YFormElementText from './y-form-elements/y-form-element-text.vue';
import YFormElementCheckbox from './y-form-elements/y-form-element-checkbox.vue';
import YFormElementCheckboxes from './y-form-elements/y-form-element-checkboxes.vue';
import YFormElementSelect from './y-form-elements/y-form-element-select.vue';
import YFormElementRadios from './y-form-elements/y-form-element-radios.vue';
import YFormElementTextarea from './y-form-elements/y-form-element-textarea.vue';
import YFormElementSimpleFile from './y-form-elements/y-form-element-simple-file.vue';

export default {
  name: 'YFormVuetify',
  props: {
    target: {
      type: Object,
      required: true
    },
    fields: {
      type: Array,
      required: true
    },
    valid: {
      type: Boolean,
      default: true
    },
    targetIndex: Number,
    noBottomPadding: Boolean
  },
  components: {
    'y-form-element-text': YFormElementText,
    'y-form-element-checkbox': YFormElementCheckbox,
    'y-form-element-checkboxes': YFormElementCheckboxes,
    'y-form-element-select': YFormElementSelect,
    'y-form-element-radios': YFormElementRadios,
    'y-form-element-textarea': YFormElementTextarea,
    'y-form-element-simple-file': YFormElementSimpleFile,
    'y-form-element-series': () => import('./y-form-series' /* webpackChunkName: 'y-form-series' */),
    'y-form-element-color': () => import('./y-form-elements/y-form-element-color.vue' /* webpackChunkName: 'y-form-element-color' */),
    'y-form-element-date': () => import('./y-form-elements/y-form-element-date.vue' /* webpackChunkName: 'y-form-element-date' */),
    'y-form-element-time': () => import('./y-form-elements/y-form-element-time.vue' /* webpackChunkName: 'y-form-element-time' */)
  },
  data: () => ({
    validations: {},
    recomputeKey: 1
  }),
  computed: {
    filteredFields() {
      return (this.recomputeKey + 1) && this.fields.filter(it => !it.vIf || conforms(this.target, it.vIf));
    },
    filteredValidatedFields() {
      return this.filteredFields.map(field => ({
        ...field,
        error: (this.validations[field.key] === false || typeof this.validations[field.key] === 'string') || field.error,
        success: (this.validations[field.key] === true) || field.success,
        message: (typeof this.validations[field.key] === 'string' ? (this.validations[field.key] || 'مقدار وارد شده صحیح نیست!') : undefined) || field.message
      }));
    }
  },
  watch: {
    validations: {
      deep: true,
      handler() {
        this.checkValidations();
      }
    },
    recomputeKey() {
      this.checkValidations();
    }
  },
  methods: {
    mapElementType(field) {
      return `y-form-element-${field.type}`;
    },
    revalidateAll() {
      for (const element of this.$refs.fieldElements || []) {
        element.revalidateAll?.();
        element.validateValue?.();
      }
    },
    checkValidations() {

      const newValidations = { ...this.validations };

      for (const key of Object.keys(newValidations)) {
        if (!this.filteredFields.find(it => it.key === key)) {
          delete newValidations[key];
        }
      }

      const isValid = Object.values(newValidations).filter(v => v !== undefined).every(v => v === true);

      const allFieldKeysWithRules = this.filteredFields.filter(field => field.rules?.length > 0).map(f => f.key);
      const validatedFieldKeys = Object.keys(newValidations);
      const nonValidatedField = allFieldKeysWithRules.filter(key => !validatedFieldKeys.includes(key));
      const isAnyUnvalidated = nonValidatedField.length === 0;

      this.$emit('update:valid', isValid && isAnyUnvalidated);

      if (JSON.stringify(this.validations) !== JSON.stringify(newValidations)) {
        this.validations = newValidations;
      }

    },
    handleInput(field, text, auxiliaryValue) {

      if (field.type === 'checkboxes' || field.type === 'switches') {
        if (text) {
          this.$set(this.target, field.key, [
            ...(this.target[field.key] || []),
            text
          ]);
        }
        else {
          if (this.target[field.key]) {

            const index = this.target[field.key].indexOf(auxiliaryValue);

            this.$set(
              this.target,
              field.key,
              this.target[field.key].filter((_, itIndex) => index !== itIndex)
            );

          }
        }

        this.$emit('update:key', field.key, this.target[field.key]);
        this.recomputeKey = Math.random() + 0.44;
        return;

      }

      const value = field.number ? parseFloat(text || field.defaultNumber || '0', field.radix || 10) : text;

      if (field.setter) {
        field.setter(this.target, value, this.targetIndex);
      }
      else {
        this.$set(this.target, field.key, value);
        this.$forceUpdate(); // TODO: remove this !!
      }

      this.$emit('update:key', field.key, this.target[field.key]);
      this.recomputeKey = Math.random() + 0.44;

    }
  }
};

</script>
