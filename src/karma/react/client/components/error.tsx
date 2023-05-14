import Header from "./header";
import Footer from "./footer";
import { XCircleIcon } from "./icons";

interface Props {
	message?: string;
}

const Error = ({ message = "" }: Props) => {
	if (!message) return null;

	return (
		<>
			<Header />
			<main className="flex w-full flex-1 flex-col p-8">
				<div className="rounded-md bg-red-50 p-4">
					<div className="flex">
						<div className="flex-shrink-0">
							<XCircleIcon
								className="h-5 w-5 text-red-400"
								aria-hidden="true"
							/>
						</div>
						<div className="ml-3">
							<h3 className="text-sm font-medium text-red-800">Error</h3>
							<div className="mt-2 text-sm text-red-700">
								<ul role="list" className="list-disc space-y-1 pl-5">
									<li>{message}</li>
									<li>Please try again by refreshing the page.</li>
								</ul>
							</div>
						</div>
					</div>
				</div>
			</main>
			<Footer />
		</>
	);
};

export default Error;
