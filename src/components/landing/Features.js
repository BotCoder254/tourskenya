import { motion } from 'framer-motion';
import { FaWallet, FaShieldAlt, FaHeadset, FaMapMarkedAlt } from 'react-icons/fa';
import { animations } from '../../constants/theme';

const features = [
  {
    icon: <FaWallet className="text-4xl text-primary" />,
    title: 'Affordable Tours',
    description: 'Experience Kenya without breaking the bank with our competitive pricing.'
  },
  {
    icon: <FaShieldAlt className="text-4xl text-primary" />,
    title: 'Secure Payments',
    description: 'Your transactions are protected with industry-standard security.'
  },
  {
    icon: <FaHeadset className="text-4xl text-primary" />,
    title: '24/7 Support',
    description: 'Our dedicated team is always here to assist you whenever you need help.'
  },
  {
    icon: <FaMapMarkedAlt className="text-4xl text-primary" />,
    title: 'Expert Guides',
    description: "Local guides with deep knowledge of Kenya's best destinations."
  }
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

const Features = () => {
  return (
    <section className="py-20 bg-neutral">
      <div className="container mx-auto px-6">
        <motion.div
          initial={animations.fadeIn.initial}
          animate={animations.fadeIn.animate}
          transition={animations.fadeIn.transition}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold text-gray-800 mb-4">
            Why Choose Us?
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            We provide the best tour experiences in Kenya with our comprehensive services and dedicated team.
          </p>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              variants={item}
              className="bg-white rounded-lg p-8 shadow-lg hover:shadow-xl transition-shadow duration-300"
              whileHover={{ y: -5 }}
            >
              <div className="flex flex-col items-center text-center">
                {feature.icon}
                <h3 className="text-xl font-semibold mt-4 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default Features; 