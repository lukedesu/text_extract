import { mapState } from 'vuex';
import get from 'lodash/get';

export default {
  data() {
    return {
      emicoFootnote: undefined
    };
  },

  computed: {
    ...mapState({
      $_emicoFootnote_footnoteText({ product }) {
        const productData = this.product || product.entity;
        return get(productData, 'emicoFootnote');
      }
    })
  },

  methods: {
    $_emicoFootnote_addFootnote() {
      if (this.$_emicoFootnote_footnoteText) {
        this.emicoFootnote = this.$addFootnote(this.$_emicoFootnote_footnoteText, 'EmicoMixin');
      }
    }
  },

  created() {
    this.$nextTick()
      .then(() => {
        this.$registerProducer('EmicoMixin');
        this.$_emicoFootnote_addFootnote();
      });
  }
};
