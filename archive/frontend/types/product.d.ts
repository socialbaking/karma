type ProducType = {
  id: number;
  attributes: {
    name: string;
    THC: string;
    CBD: string;
    createdAt: string;
    updatedAt: string;
    category: {
      data: {
        id: number;
        attributes: {
          name: string;
        };
      };
    }
  };
};

export default ProductType;