<template>
  <div class="dcp-vehicle-details">
  <div class="dcp-vehicle-details__category dcp-vehicle-details-category"
       v-if="vehicleDetails && vehicleDetails.length > 0">
    <h2 class="dcp-vehicle-details-category__title">{{ $t('dcp.pdp.vehicleDetails.title') }}</h2>
    <ul class="dcp-vehicle-details-category__list dcp-vehicle-details-list">
      <li
        class="dcp-vehicle-details-list__item dcp-vehicle-details-list-item"
        v-for="(value, index) in vehicleDetails"
        :key="index"
        :data-test-id="`dcp-vehicle-details-list-item-${index}`">
        <span class="dcp-vehicle-details-list-item__label">{{ $t(value.translationKey) }}</span>
        <span class="dcp-vehicle-details-list-item__value">{{ value.displayValue }}</span>
      </li>
    </ul>
  </div>
  <div class="dcp-vehicle-details__category dcp-vehicle-details-category"
       v-if="emico && emico.length > 0">
    <h2
      class="dcp-vehicle-details-category__title">
        {{ $t('dcp.pdp.emico.title') }}
    </h2>
    <ul class="dcp-vehicle-details-category__list dcp-vehicle-details-list">
      <li
        class="dcp-vehicle-details-list__item dcp-vehicle-details-list-item"
        v-for="(value, index) in emico"
        :key="index"
        :data-test-id="`dcp-vehicle-emico-details-list-item-${index}`">
        <span class="dcp-vehicle-details-list-item__label">{{ value.label }}</span>
        <span class="dcp-vehicle-details-list-item__value">
          {{ value.displayValue }}
        </span>
      </li>
    </ul>
  </div>
</div>

</template>

<script>
import CoreVehicleDetails from '@dcp-vue/platform-core/src/components/vehicle/vehicleDetails/generic/index.vue';

export default {
  extends: CoreVehicleDetails
};
</script>
