<template>
  <div class="y-form-element-checkboxes">

    <span class="d-inline-block" :style="field.horizontal ? 'position: relative; bottom: 6px !important;' : ''">
      <v-label>{{ field.title }}</v-label>
    </span>

    <v-checkbox
      v-for="(item, index) in fieldItems"
      :key="item.value"
      hide-details
      :label="itemTextOf(item)"
      :value="itemValueOf(item)"
      :dir="field.dir"
      :disabled="field.disabled"
      :readonly="field.readonly"
      :error="field.error"
      :success="field.success"
      class="mt-0"
      :class="{
        'mt-2': index === 0 && !field.horizontal,
        'mt-1': index !== 0 && !field.horizontal,
        'd-inline-block me-3 mb-2': field.horizontal,
        'ms-6': field.horizontal && index === 0
      }"
      @change="handleChange($event, item)"
    />

    <div v-if="field.hint" class="caption mt-1 ms-2">
      {{ typeof field.hint === 'function' ? field.hint(value) : field.hint }}
    </div>

    <transition name="slide-from-up">
      <div v-if="field.message" class="caption mt-1 ms-2" :class="{ 'error--text': field.error, 'success--text': field.success }">
        {{ field.message }}
      </div>
    </transition>

  </div>
</template>

<script>

import { YFormElementMixin } from '../mixins/y-form-element-mixin';

export default {
  name: 'YFormElementCheckboxes',
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
    itemValueOf(item) {

      if (this.field.itemValue) {
        if (typeof this.field.itemValue === 'function') {
          return this.field.itemValue(item);
        }
        else {
          return item[this.field.itemValue];
        }
      }

      if ('value' in item) return item.value;
      return item;

    },
    itemTextOf(item) {

      if (this.field.itemText) {
        if (typeof this.field.itemText === 'function') {
          return this.field.itemText(item);
        }
        else {
          return item[this.field.itemText];
        }
      }

      if ('text' in item) return item.text;
      return item;

    },
    async handleChange(value, item) {
      this.$emit('input', value, item.value);
      await this.$nextTick();
      this.validateValue();
    }
  }
}

</script>
