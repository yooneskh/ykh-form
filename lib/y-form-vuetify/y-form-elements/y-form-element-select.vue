<template>
  <v-combobox
    v-if="field.addable"
    filled
    :label="field.title"
    :loading="loading"
    :items="fieldItems"
    :item-value="field.itemValue"
    :item-text="field.itemText"
    :chips="field.multiple" deletable-chips :small-chips="field.multiple"
    :multiple="field.multiple"
    :value="value"
    :dir="field.dir"
    :disabled="field.disabled"
    :readonly="field.readonly"
    :autofocus="field.autofocus"
    @input="handleInput"
    @blur="validateValue"
    :error="field.error"
    :success="field.success"
    :messages="field.message"
    :hint="typeof field.hint === 'function' ? field.hint(value) : field.hint"
    persistent-hint
    :hide-details="!field.message && !field.hint"
  />
  <v-autocomplete
    v-else-if="field.searchable"
    filled
    :label="field.title"
    :loading="loading"
    :items="fieldItems"
    :item-value="field.itemValue"
    :item-text="field.itemText"
    :chips="field.multiple" deletable-chips :small-chips="field.multiple"
    :multiple="field.multiple"
    :value="value"
    :dir="field.dir"
    :disabled="field.disabled"
    :readonly="field.readonly"
    :autofocus="field.autofocus"
    @input="handleInput"
    @blur="validateValue"
    :error="field.error"
    :success="field.success"
    :messages="field.message"
    :hint="typeof field.hint === 'function' ? field.hint(value) : field.hint"
    persistent-hint
    :hide-details="!field.message && !field.hint"
  />
  <v-select
    v-else
    :filled="!field.unfilled"
    :label="field.title"
    :loading="loading"
    :items="fieldItems"
    :item-value="field.itemValue"
    :item-text="field.itemText"
    :multiple="field.multiple"
    :value="value"
    :dir="field.dir"
    :disabled="field.disabled"
    :readonly="field.readonly"
    :autofocus="field.autofocus"
    @input="handleInput"
    @blur="validateValue"
    :error="field.error"
    :success="field.success"
    :messages="field.message"
    :hint="field.hint"
    persistent-hint
    :hide-details="!field.message && !field.hint"
  />
</template>

<script>

import { YFormElementMixin } from '../mixins/y-form-element-mixin'

export default {
  name: 'YFormElementSelect',
  mixins: [YFormElementMixin],
  props: {
    target: { },
    value: { },
    field: {
      type: Object,
      required: true
    }
  },
  data: () => ({
    loading: false
  }),
  asyncComputed: {
    fieldItems: {
      default: [],
      async get() {

        if (typeof this.field.items === 'function') {
          this.loading = true;
          const result = await this.field.items(this.target);
          this.loading = false;
          return result;
        }

        return this.field.items;

      }
    }
  },
  methods: {
    async handleInput(value) {

      this.$emit('input', value);

      if (!this.field.lazy) {
        await this.$nextTick();
        this.validateValue();
      }

    }
  }
}

</script>
