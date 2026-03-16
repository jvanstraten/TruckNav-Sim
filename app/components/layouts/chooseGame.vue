<script lang="ts" setup>
const props = defineProps<{
    launchMap: () => void;
    goToDesktopIndex: () => void;
}>();
const { selectedGame, commitSelection } = useGameSelection();
const { isWeb, isElectron } = usePlatform();

const handleStart = () => {
    commitSelection();
    props.launchMap();
};
</script>

<template>
    <div class="choose-game-section">
        <div class="top-tagline">
            <button
                v-show="isElectron"
                @click="goToDesktopIndex"
                class="back-btn"
            >
                <Icon name="material-symbols:arrow-back-rounded" size="22" />
            </button>

            <Icon name="material-symbols:globe" class="icon" size="22" />
            <span>Select Game</span>
        </div>

        <div class="game-selection" :style="{ width: isWeb ? '80%' : '85%' }">
            <div class="select-btns">
                <GameSelection
                    v-model="selectedGame"
                    :width="isWeb ? 450 : 950"
                />
            </div>
        </div>

        <button
            :disabled="!selectedGame"
            @click.prevent="handleStart"
            class="btn nav-btn"
        >
            <span>Start Navigation</span>
            <Icon name="material-symbols:map-rounded" size="20" />
        </button>
    </div>
</template>

<style
    lang="scss"
    scoped
    src="~/assets/scss/scoped/layouts/chooseGame.scss"
></style>
