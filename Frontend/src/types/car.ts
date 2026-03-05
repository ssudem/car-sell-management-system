export interface Car {
    id: number;
    title: string;
    brand: string;
    price: number;
    year: number;
    mileage: number;
    fuel_type: string;
    transmission: string;
    condition: string;
    status: "Available" | "Pending" | "Sold";
    description: string;
    image: string;
    images?: string[];
}
