export default {
  data() {
    return {
      pageFootnotes: undefined
    };
  },

  watch: {
    /**
     * The footnotesConfig data property is a list of { label, producer } config
     * objects used to 1. register a footnote producer, and 2. add the footnote to
     * the current page.
     */
    footnotesConfig: {
      handler() {
        this.$clearFootnotes();

        if (this.footnotesConfig) {
          this.pageFootnotes = this.footnotesConfig
            .map(({ label, producer }) => {
              this.$registerProducer(producer);
              return this.$addFootnote(this.$i18n.t(label), producer);
            });
        }
      },
      immediate: true
    }
  }
};
