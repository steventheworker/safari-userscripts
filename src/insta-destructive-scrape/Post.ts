type PostPropertiesTypes =
	| (string | undefined)
	| Array<String>
	| (() => Array<string>);

export class Post {
	[key: string]: PostPropertiesTypes;
	static csv_cols: Array<string> = [
		"url",
		"user",
		"date",
		"caption",
		"media",
		"metadata",
	];
	url: string;
	user?: string;
	date?: string;
	caption?: string;
	media: Array<string>;
	metadata?: string;
	constructor(url: string) {
		this.url = url;
		this.media = [];
	}
	csvRow() {
		return Post.csv_cols.map((col) => {
			let val: PostPropertiesTypes = this[col] as PostPropertiesTypes;
			return csvClean(
				Array.isArray(val) ? JSON.stringify(val) : (val as string),
			);
		});
	}
}

export const downloadCSV = (csv: string) => {
	console.log("downloaded csv of posts");
	const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
	const link = document.createElement("a");
	const url = URL.createObjectURL(blob);
	link.href = URL.createObjectURL(blob);
	link.download = `insta-destructive-scrape-${new Date()
		.toLocaleString("en-US", {
			timeZone: "America/Los_Angeles",
			month: "2-digit",
			day: "2-digit",
			year: "numeric",
			hour: "2-digit",
			minute: "2-digit",
			hour12: false,
		})
		.replace(/\/|, /g, "-")
		.replace(" ", "-")
		.replace(":", ":")}.csv`; // Specify the filename
	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);
	URL.revokeObjectURL(url); // Clean up
};

function csvClean(feature: string) {
	if (!feature) return "";
	if (
		feature.includes('"') ||
		feature.includes(",") ||
		feature.includes("\n")
	)
		return `"${feature.replace(/"/g, '""')}"`;
	return feature;
}
