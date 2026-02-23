<script setup lang="ts">
import { KeepAwake } from "@capacitor-community/keep-awake";

onMounted(async () => {
    const { initSettings } = useSettings();
    initSettings();

    const result = await KeepAwake.isSupported();
    if (result.isSupported) {
        await KeepAwake.keepAwake();
    }
});
</script>

<template>
    <UApp>
        <NuxtLayout>
            <NuxtPage />
        </NuxtLayout>
    </UApp>
</template>

<style lang="scss">
@use "~/assets/scss/global/global";
</style>
