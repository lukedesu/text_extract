<template src="./frameFooter.html"></template>
<script>
import { getConfiguration } from '@dcp-vue/platform-core/src/utils/configuration';
import CoreFrameFooterComponent from '@dcp-vue/platform-core/src/components/frame/frameFooter/generic/index.vue';
import states from '../../../utils/fsmStates.json';

const CUSTOMIZED_CC_PAGES = [states.srp.name, states.pdp.name];
// OTOS-1006: no more than four items here, translation strings defined under `dcp.footer.link`
const FOOTER_LINKS_KEY = ['privacyPolicy', 'legalNotice'];

export default {
  extends: CoreFrameFooterComponent,

  computed: {
    copyrightLink() {
      if (this.$i18n.t('dcp.footer.copyright.url') !== 'dcp.footer.copyright.url') {
        return this.$i18n.t('dcp.footer.copyright.url');
      }
      return '';
    },

    customizedFooterLinks() {
      return FOOTER_LINKS_KEY.map((key) => {
        const prefix = `dcp.footer.link.${key}`;
        return {
          content: this.$i18n.t(`${prefix}.content`),
          title: this.$i18n.t(`${prefix}.title`),
          url: this.$i18n.t(`${prefix}.url`)
        };
      });
    },

    isCustomizedFooter() {
      return CUSTOMIZED_CC_PAGES.includes(this.$route.name);
    },

    // [OTOS-1176]: use a computed property to enable reactivity, if the language is changed
    footerCookieLink() {
      const { cookieLinkBaseUrl, lang, shopCountry } = getConfiguration('cookieLinkBaseUrl', 'lang', 'shopCountry');

      // [OTOS-1176]: allow localised URLs as cookie links
      return this.$i18n.te('dcp.footer.link.cookies.url') ? this.$i18n.t('dcp.footer.link.cookies.url') : `${cookieLinkBaseUrl}?m=${shopCountry}&a=dcp&l=${lang}`;
    }
  }
};
</script>
<style src="@dcp-vue/platform-core/src/components/frame/frameFooter/generic/frameFooter.scss" lang="scss"></style>
