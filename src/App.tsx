import { useActionState } from "react";
import type { InferResponseType } from "hono";
import { hc } from "hono/client";
import { type AppType } from "../worker/index.ts";

const client = hc<AppType>(import.meta.env.BASE_URL);

type Meta = InferResponseType<typeof client.api.index.$get>;

type ActionState =
	| { meta: Meta; error?: never }
	| { meta?: never; error: Error }
	| undefined;

async function fetchMeta(
	_previousState: ActionState,
	formData: FormData,
): Promise<ActionState> {
	const response = await client.api.index.$get({
		query: {
			url: formData.get("url") as string,
		},
	});

	if (!response.ok) {
		return {
			error: new Error(response.statusText),
		};
	}

	return {
		meta: await response.json(),
	};
}

function App() {
	const [state, formAction, isPending] = useActionState(fetchMeta, undefined);

	return (
		<main className="mx-auto mt-24 grid max-w-128 gap-4 p-4">
			<form action={formAction} className="grid">
				<label htmlFor="url" className="sr-only">
					URL
				</label>
				<input
					required
					id="url"
					type="url"
					name="url"
					placeholder="https://"
					className="rounded-md border p-2 outline-offset-2 outline-black focus:outline-1"
				/>
				<button type="submit" className="sr-only">
					Submit
				</button>
			</form>
			{isPending && <MetaSkeleton />}

			{!isPending && state?.meta && <MetaCard meta={state.meta} />}

			{!isPending && state?.error && (
				<p className="text-red-800 dark:text-red-200">
					{state.error.message}
				</p>
			)}
		</main>
	);
}

function MetaSkeleton() {
	return (
		<div className="overflow-clip rounded-md border">
			<div className="h-96 w-full bg-neutral-200 object-cover dark:bg-neutral-800" />
			<div className="p-4">
				<div className="h-7 rounded-sm bg-neutral-200 dark:bg-neutral-800" />
				<div className="mt-1 h-10 rounded-sm bg-neutral-200 dark:bg-neutral-800" />
				<div className="mt-2 flex flex-row items-center gap-2">
					<div className="aspect-square h-4 rounded-full bg-neutral-200 dark:bg-neutral-800" />
					<div className="aspect-10/1 h-5 rounded-sm bg-neutral-200 dark:bg-neutral-800" />
				</div>
			</div>
		</div>
	);
}

function MetaCard({ meta }: { meta: Meta }) {
	return (
		<div className="overflow-clip rounded-md border">
			<img src={meta.image} className="h-96 w-full object-cover" />
			<div className="p-4">
				<h2 className="line-clamp-1 text-lg font-semibold">
					{meta.title}
				</h2>
				<p className="mt-1 line-clamp-2 text-sm">{meta.description}</p>
				<div className="mt-2 flex flex-row items-center gap-2">
					<img
						src={meta.favicon}
						className="aspect-square h-4 rounded-full"
					/>
					<p className="text-sm">{meta.domain}</p>
				</div>
			</div>
		</div>
	);
}

export default App;
