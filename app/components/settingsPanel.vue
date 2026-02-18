<script lang="ts" setup>
import { AppSettings } from "~~/shared/constants/appSettings";

defineProps<{ closePanel: () => void }>();

const { settings, updateSettings } = useSettings();
</script>

<template>
    <div class="settings-panel">
        <div class="settings-title setting">
            <div class="icon-btn" v-on:click="closePanel">
                <Icon name="material-symbols:arrow-back-rounded" size="26" />
            </div>

            <div class="title-icon">
                <Icon name="flowbite:cog-outline" size="38" />

                <div>
                    <h2>Settings</h2>
                    <p class="panel-description">
                        App preferences and customization
                    </p>
                </div>
            </div>
        </div>

        <div class="separator"></div>

        <div class="theme setting">
            <div class="setting-title">
                <Icon name="solar:pallete-2-linear" size="24" />
                <p>Theme</p>
            </div>
            <div class="color-options">
                <p>Current Color:</p>
                <color-picker
                    v-model="settings.themeColor"
                    v-slot="{ color, show }"
                    @change="updateSettings('themeColor', $event.hex)"
                    :with-colors-history="6"
                >
                    <button
                        class="nav-btn change-btn"
                        @click="show"
                        :style="{ backgroundColor: color.value }"
                    >
                        Change
                    </button>
                </color-picker>
            </div>
        </div>

        <div class="theme setting">
            <div class="setting-title">
                <Icon name="solar:pallete-2-linear" size="24" />
                <p>Route Color</p>
            </div>
            <div class="color-options">
                <p>Current Color:</p>
                <color-picker
                    v-model="settings.routeColor"
                    v-slot="{ color, show }"
                    @change="updateSettings('routeColor', $event.hex)"
                    :with-colors-history="6"
                >
                    <button
                        class="nav-btn change-btn"
                        @click="show"
                        :style="{ backgroundColor: color.value }"
                    >
                        Change
                    </button>
                </color-picker>
            </div>
        </div>
    </div>
</template>

<style lang="scss" src="~/assets/scss/scoped/settingsPanel.scss"></style>
