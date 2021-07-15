<template>
  <v-radio-group
    class="mt-0"
    :class="{'horizontal': field.horizontal}"
    :label="field.title"
    :hide-details="!field.message && !field.hint"
    :row="field.horizontal"
    :value="value"
    :dir="field.dir"
    :disabled="field.disabled"
    :readonly="field.readonly"
    :error="field.error"
    :success="field.success"
    :messages="field.message"
    :hint="typeof field.hint === 'function' ? field.hint(value) : field.hint"
    persistent-hint
    @change="handleChange"
    style="text-align: unset;">
    <v-radio
      v-for="(item, index) in fieldItems"
      :key="itemValueOf(item)"
      :label="itemTextOf(item)"
      :value="itemValueOf(item)"
      :dir="field.dir"
      :class="{
        'mt-1': !field.horizontal && index === 0,
        'ms-0 me-3 mb-2': field.horizontal,
        'ms-6': field.horizontal && index === 0,
        [field.itemClass]: !!field.itemClass
      }"
    />
  </v-radio-group>
</template>

<script>

import { YFormElementMixin } from '../mixins/y-form-element-mixin';

export default {
  name: 'YFormElementRadios',
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
    async handleChange(value) {
      this.$emit('input', value);
      await this.$nextTick();
      this.validateValue();
    }
  }
}

</script>

<style lang="scss" scoped>
  ::v-deep.v-input.horizontal {
    padding-top: 10px;
    legend {
      padding: 0;
    }
    .v-radio {
      margin-bottom: 0 !important;
    }
  }
</style>