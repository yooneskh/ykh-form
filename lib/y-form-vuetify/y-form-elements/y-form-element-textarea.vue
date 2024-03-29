<template>
  <v-textarea
    :value="currentValue"
    @input="handleInput"
    :filled="!field.unfilled"
    :label="field.title"
    :solo="field.solo || field.simple"
    :flat="field.flat || field.simple"
    :placeholder="field.placeholder"
    :class="field.classes"
    :dir="field.dir"
    :rows="field.rows"
    :auto-grow="field.autoGrow"
    :disabled="field.disabled"
    :readonly="field.readonly"
    :autofocus="field.autofocus"
    @blur="validateValue"
    :error="field.error"
    :success="field.success"
    :messages="field.message"
    :hint="typeof field.hint === 'function' ? field.hint(value) : field.hint"
    persistent-hint
    :hide-details="!field.message && !field.hint">
    <template v-if="field.variants" #append>

      <v-menu v-if="field.variants" absolute>
        <template #activator="{ on, attrs }">
          <v-btn rounded small text v-on="on" v-bind="attrs" class="px-2" min-width="0">
            {{ currentLanguage }}
          </v-btn>
        </template>
        <v-list dense>
          <v-list-item v-for="(value, key) of field.variants" :key="key" @click="changeLanguageTo(key)">
            <v-list-item-content>
              <v-list-item-title>{{ key }}</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </v-list>
      </v-menu>

    </template>
  </v-textarea>
</template>

<script>

import { YFormElementMixin } from '../mixins/y-form-element-mixin';

export default {
  name: 'YFormElementTextArea',
  props: {
    value: { },
    field: {
      type: Object,
      required: true
    }
  },
  mixins: [YFormElementMixin],
  data: () => ({
    currentLanguage: '',
    currentLanguageChanged: false
  }),
  computed: {
    currentValue() {
      if (!this.field.variants) return this.value;

      if (!this.value) return '';
      return this.value[this.currentLanguage];

    }
  },
  created() {
    if (this.field.variants) {
      this.currentLanguage = Object.keys(this.field.variants)[0];
      if (!this.value || typeof this.value !== 'object' || Array.isArray(this.value)) this.$emit('input', {});
    }
  },
  methods: {
    changeLanguageTo(language) {

      this.currentLanguageChanged = true;
      setTimeout(() => this.currentLanguageChanged = false, 200);

      this.currentLanguage = language;

    },
    async handleInput(text) {
      if (this.currentLanguageChanged) return;

      if (this.field.variants) {

        this.$emit(
          'input',
          {
            ...(this.value || {}),
            [this.currentLanguage]: text
          }
        );

        await this.$nextTick();
        if (!this.field.lazy) this.validateValue();

        return;

      }

      this.$emit('input', text);
      await this.$nextTick();
      if (!this.field.lazy) this.validateValue();

    }
  }
}

</script>
