// This file should be used to store, in a centralized fashion, lists of options (Enums)
// used in the FE. The properties of these options should also be stored here.
//
// To refer to a specific option you should use for example: Enums.Salutations.Mr.
// To refer to a specific property of an option you should use for example: Enums.Salutations.properties[Enums.Salutations.Mr].
// To loop trough all the options you can just loop trough the properties array of each Enum.


const Salutations = {
  Mr: 0,
  Ms: 1,

  properties: [
    {
      id: 0,
      translationKey: 'dcp.form.field.salutation.value.mr',
      name: 'mr',
      value: 'slt_mr',
      possibleValues: [
        'slt_mr',
        'mr',
        'MR'
      ]
    },
    {
      id: 1,
      translationKey: 'dcp.form.field.salutation.value.ms',
      name: 'ms',
      value: 'slt_ms',
      possibleValues: [
        'slt_ms',
        'ms',
        'MS',
        'MRS',
        'MME',
        'MISS'
      ]
    }
  ]
};

const FilterTypes = {
  MultiSelect: 0,
  Slider: 1,

  properties: [
    {
      id: 0,
      name: 'multiSelect'
    },
    {
      id: 1,
      name: 'slider'
    }
  ]
};

const CurrencyIso = {
  EUR: 0,
  USD: 1,
  THB: 2,

  properties: [
    {
      id: 0,
      name: '€'
    },
    {
      id: 1,
      name: '$'
    },
    {
      id: 2,
      name: '฿'
    }
  ]
};

export default {
  CurrencyIso,
  Salutations,
  FilterTypes
};
