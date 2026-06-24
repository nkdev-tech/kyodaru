const { withStringsXml } = require('@expo/config-plugins');

function withAndroidAppLabel(config, { label }) {
  return withStringsXml(config, (config) => {
    const strings = config.modResults.resources.string ?? [];
    const withoutAppName = strings.filter((s) => s.$.name !== 'app_name');
    config.modResults.resources.string = [
      ...withoutAppName,
      { $: { name: 'app_name', translatable: 'false' }, _: label },
    ];
    return config;
  });
}

module.exports = withAndroidAppLabel;
