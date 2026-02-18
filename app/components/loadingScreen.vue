<script lang="ts" setup>
import { darkenColor } from "~/assets/utils/colors";

defineProps<{ progress: number }>();
const { settings } = useSettings();
</script>

<template>
    <div class="loading-screen">
        <div
            class="progress-text"
            :style="{
                color: darkenColor(settings.themeColor, 0.2),
            }"
        >
            {{ progress }}%
        </div>
        <div class="progress-bar-bg">
            <div
                class="progress-bar-fill"
                :style="{
                    width: progress + '%',
                    backgroundColor: darkenColor(settings.themeColor, 0.2),
                }"
            ></div>
        </div>
        <h2>Loading Route Data...</h2>
    </div>
</template>

<style lang="scss" scoped src="~/assets/scss/scoped/loadingScreen.scss"></style>
