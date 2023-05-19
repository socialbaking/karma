import {
  AnnotationIcon,
  GlobeAltIcon,
  LightningBoltIcon,
  ScaleIcon,
} from "./icons";

const data = [
  {
    name: "Community Built.",
    description:
      "A community built website for medicinal cannabis education is an amazinng way to provides access to reliable, evidence-based information and empowers individuals to make informed decisions about their health. It also connects people interested in medicinal cannabis and improves health outcomes through safe and effective use.",
    icon: GlobeAltIcon,
  },
  {
    name: "Complete transparency.",
    description:
      "We are a community built website and we want to hear from you. We are committed to providing the most up-to-date information on the latest research and developments in the field of medicinal cannabis.",
    icon: ScaleIcon,
  },
  {
    name: "Real reviews. Real People.",
    description:
      "Eveyrone gets a voice. We believe that everyone should have a voice and that everyone should be able to share their experiences. We are a community built website and we want to hear from you.",
    icon: LightningBoltIcon,
  },
  {
    name: "Market Tracker.",
    description:
      "Our Market analysis tracks medicinal cannabis product prices helps individuals save money by providing up-to-date information for informed purchasing decisions.",
    icon: AnnotationIcon,
  },
];

function Features() {
  return (
    <div className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:text-center">
          <h2 className="text-base text-green-600 font-semibold tracking-wide uppercase">
            Your experiences. Your data. Your insights.
          </h2>
          <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            We're here for your health.
          </p>
          <p className="mt-4 max-w-4xl text-xl text-gray-500 lg:mx-auto">
            A better way to find{" "}
            <span className=" text-green-600 font-semibold">
              medicinal cannabis
            </span>{" "}
            products and services in{" "}
            <span className=" text-green-600 font-semibold">New Zealand</span>.
          </p>
        </div>

        <div className="mt-10">
          <dl className="space-y-10 md:space-y-0 md:grid md:grid-cols-2 md:gap-x-8 md:gap-y-10">
            {data.map((feature) => (
              <div key={feature.name} className="relative">
                <dt>
                  <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-green-700 text-white">
                    <feature.icon className="h-6 w-6" aria-hidden="true" />
                  </div>
                  <p className="ml-16 text-lg leading-6 font-medium text-gray-900">
                    {feature.name}
                  </p>
                </dt>
                <dd className="mt-2 ml-16 text-base text-gray-500">
                  {feature.description}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </div>
  );
}

export default Features;
