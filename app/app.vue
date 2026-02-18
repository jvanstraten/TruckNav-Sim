<script setup lang="ts">
onMounted(() => {
    const { initSettings } = useSettings();
    initSettings();
});
</script>

<template>
    <NuxtPage />
</template>

<style lang="scss">
@use "~/assets/scss/global/global";
</style>
