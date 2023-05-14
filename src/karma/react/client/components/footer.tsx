import React from "react";
import {Logo} from "./logo";

const FooterContent = () => (
	<div className="container px-5 py-8 mx-auto flex items-center sm:flex-row flex-col">
		<div className="flex title-font font-medium items-center md:justify-start justify-center text-green-600">
			<Logo primary="pharma" secondary="karma" />
		</div>
	</div>
);

const MemoizedFooterContent = React.memo(FooterContent);

function Footer() {
	return (
		<footer className="bg-gray-800" aria-labelledby="footer-heading">
			<MemoizedFooterContent />
		</footer>
	);
}

export default Footer;
