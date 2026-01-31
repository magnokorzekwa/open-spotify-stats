import type SpotifyModel from "@/models/SpotifyModel";

export function sortSpotifyModelByTs(streams: SpotifyModel[]): SpotifyModel[] {
    return streams.sort((a: SpotifyModel, b: SpotifyModel) => new Date(a.ts).getTime() - new Date(b.ts).getTime());
}