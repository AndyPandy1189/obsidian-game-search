import { requestUrl } from 'obsidian';

export interface IGDBGame {
	id: number;
	name: string;
	summary?: string;
	first_release_date?: number;
	involved_companies?: { company: { name: string }, developer: boolean, publisher: boolean }[];
	genres?: { name: string }[];
	platforms?: { name: string }[];
	cover?: { url: string };
	rating?: number;
	aggregated_rating?: number;
	storyline?: string;
	game_modes?: { name: string }[];
	themes?: { name: string }[];
	franchises?: { name: string }[];
	collection?: { name: string };
	url?: string;
	screenshots?: { url: string }[];
	similar_games?: { name: string }[];
}

export class IGDBClient {
	private clientId: string;
	private clientSecret: string;
	private accessToken: string | null = null;

	constructor(clientId: string, clientSecret: string) {
		this.clientId = clientId;
		this.clientSecret = clientSecret;
	}

	async authenticate(): Promise<boolean> {
		if (!this.clientId || !this.clientSecret) return false;

		try {
			const url = `https://id.twitch.tv/oauth2/token?client_id=${this.clientId}&client_secret=${this.clientSecret}&grant_type=client_credentials`;
			const response = await requestUrl({
				url: url,
				method: 'POST'
			});

			if (response.status === 200) {
				const data = response.json as { access_token: string };
				this.accessToken = data.access_token;
				return true;
			}
		} catch (error) {
			console.error("IGDB Authentication error:", error);
		}
		return false;
	}

	async searchGames(query: string): Promise<IGDBGame[]> {
		if (!this.accessToken) {
			const authSuccess = await this.authenticate();
			if (!authSuccess) throw new Error("Failed to authenticate with IGDB.");
		}

		try {
			const response = await requestUrl({
				url: 'https://api.igdb.com/v4/games',
				method: 'POST',
				headers: {
					'Client-ID': this.clientId,
					'Authorization': `Bearer ${this.accessToken}`,
					'Accept': 'application/json'
				},
				body: `search "${query}"; fields name,summary,first_release_date,involved_companies.company.name,involved_companies.developer,involved_companies.publisher,genres.name,platforms.name,cover.url,rating,aggregated_rating,storyline,game_modes.name,themes.name,franchises.name,collection.name,url,screenshots.url,similar_games.name; limit 20;`
			});

			if (response.status === 200) {
				return response.json as IGDBGame[];
			}
		} catch (error) {
            console.error("IGDB Search error:", error);
            throw error;
		}
		return [];
	}
}
