<template>
  <div class="y-form-series">

    <v-label>
      {{ field.title }} <span class="caption d-inline-block">({{ (target[field.key] || []).length }})</span>
      <v-btn v-if="!field.readonly && !field.disabled && !field.unaddable && (!field.maxSize || field.maxSize > (target[field.key] && target[field.key].length))" class="ms-2" small icon @click="addItem">
        <v-icon small>mdi-plus</v-icon>
      </v-btn>
    </v-label>

    <v-row dense>
      <v-col v-for="(item, index) in target[field.key]" :key="ids[index]" class="series-item" :cols="field.preemptWidth ? field.itemWidth || 12 : 12" :md="field.itemWidth || 12">
        <v-card outlined class="pa-2" style="position: relative;">

          <div class="part-container" style="pointer-events: none;">
            مورد {{ index + 1 }}
          </div>

          <y-form
            :target="item"
            :fields="injectedItemFields"
            :target-index="index"
            ref="nestedForms"
            @update:valid="$set(validations, ids[index], $event)"
            @update:key="$emit('update:key', field.key, target[field.key])"
          />

          <div class="part-container" :style="{[$vuetify.rtl ? 'left' : 'right']: '8px'}">

            <v-btn v-if="!field.readonly && !field.disabled && index > 0" icon x-small @click="moveIndexBack(index)">
              <v-icon>mdi-chevron-up</v-icon>
            </v-btn>

            <v-btn v-if="!field.readonly && !field.disabled && index < (target[field.key] || []).length - 1" icon x-small @click="moveIndexForward(index)">
              <v-icon>mdi-chevron-down</v-icon>
            </v-btn>

            <v-btn v-if="!field.readonly && !field.disabled" icon x-small @click="removeItem(index)">
              <v-icon color="error" x-small>mdi-close</v-icon>
            </v-btn>

          </div>

        </v-card>
      </v-col>
    </v-row>

  </div>
</template>

<script>
export default {
  name: 'YFormSeries',
  props: {
    target: {
      type: Object,
      required: true
    },
    field: {
      type: Object,
      required: true
    }
  },
  data: () => ({
    ids: [],
    validations: {}
  }),
  computed: {
    injectedItemFields() {
      return this.field.itemFields.map(field => ({
        ...field,
        readonly: this.field.readonly ?? field.readonly,
        disabled: this.field.disabled ?? field.disabled
      }));
    }
  },
  watch: {
    validations: {
      deep: true,
      handler() {
        const isValid = Object.values(this.validations).every(v => v === true);
        this.$emit('update:valid', isValid);
      }
    },
    target: {
      deep: true,
      async handler() {
        if (this.target[this.field.key] && this.target[this.field.key].length !== this.ids.length) {
          this.redoIds();
        }
      }
    }
  },
  created() {

    if (!this.target[this.field.key]) {
      this.$set(this.target, this.field.key, []);
    }

    this.redoIds();

  },
  methods: {
    redoIds() {
      this.ids = this.target[this.field.key].map(() => this.$uuid());
    },
    revalidateAll() {
      this.$refs.nestedForms?.forEach(it => it.revalidateAll?.());
    },
    async addItem() {

      if (!this.target[this.field.key]) {
        this.$set(this.target, this.field.key, []);
        await this.$nextTick();
      }

      this.ids.push(this.$uuid());

      this.$set(
        this.target,
        this.field.key,
        [
          ...this.target[this.field.key],
          JSON.parse(JSON.stringify(
            typeof this.field.base === 'function' ? this.field.base() : this.field.base
          ))
        ]
      );

      await this.$nextTick();
      this.$forceUpdate();

      if (this.field.itemFields.some(it => it.rules?.length > 0)) this.$emit('update:valid', false);
      this.$emit('update:key', this.field.key, this.target[this.field.key]);

    },
    removeItem(index) {

      this.$set(
        this.target,
        this.field.key,
        this.target[this.field.key].filter((_, itIndex) => index !== itIndex)
      );

      this.$delete(this.validations, this.ids[index]);
      this.ids.splice(index, 1);

      this.revalidateAll();
      this.$emit('update:key', this.field.key, this.target[this.field.key]);

    },
    moveIndexBack(index) {

      const value = this.target[this.field.key][index];
      const valueBefore = this.target[this.field.key][index - 1];

      this.$set(this.target[this.field.key], index - 1, value);
      this.$set(this.target[this.field.key], index, valueBefore);

      const id = this.ids[index];
      const idBefore = this.ids[index - 1];

      this.$set(this.ids, index - 1, id);
      this.$set(this.ids, index, idBefore);

      this.$emit('update:key', this.field.key, this.target[this.field.key]);

    },
    moveIndexForward(index) {

      const value = this.target[this.field.key][index];
      const valueBefore = this.target[this.field.key][index + 1];

      this.$set(this.target[this.field.key], index + 1, value);
      this.$set(this.target[this.field.key], index, valueBefore);

      const id = this.ids[index];
      const idBefore = this.ids[index + 1];

      this.$set(this.ids, index + 1, id);
      this.$set(this.ids, index, idBefore);

      this.$emit('update:key', this.field.key, this.target[this.field.key]);

    }
  }
};
</script>

<style lang="scss" scoped>
  .series-item {
    position: relative;
    & > .v-card > .part-container {
      position: absolute;
      top: 0px;
      opacity: 0;
      pointer-events: none;
      transition: all 0.2s ease-in-out;
    }
  }
  .series-item:hover > .v-card > .part-container {
    opacity: 1;
    pointer-events: all;
  }
</style>
