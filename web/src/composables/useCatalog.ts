import { shallowRef } from "vue";
import { api, type OrkModel } from "../api";

// catálogo compartilhado: busca uma vez e reaproveita entre as telas
const models = shallowRef<OrkModel[]>([]);
const loading = shallowRef(false);
const error = shallowRef("");
let loaded = false;

export function useCatalog() {
    async function load(force = false) {
        if (loaded && !force) return;
        loading.value = true;
        error.value = "";
        try {
            const res = await api.models();
            models.value = res.models;
            loaded = true;
        } catch (e) {
            error.value = (e as Error).message;
        } finally {
            loading.value = false;
        }
    }

    return { models, loading, error, load };
}
