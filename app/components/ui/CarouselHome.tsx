import React from "react";
import "~/styles/CarouselHome.css";
import CardCarouselHome from "./CardCarouselHome";

interface CarouselHomeProps {
    carouselItems?: { text: string; imageSrc: string }[];
    text?: string;
    size?: number;
    color?: string;
    speed?: number;
}

export default function CarouselHome({
    text = "DISPONIBLE · DISPONIBLE · DISPONIBLE ·",
    size = 160,
    color = "#000000",
    speed = 14,
}: CarouselHomeProps) {
    const radius = size / 2 - 16;
    const circumference = 2 * Math.PI * radius;

    return (
        <div className="home-hero__marquee-row">
            <div className="radial-marquee__half-circle">
                <div className="radial-marquee__circle">
                    <div className="radial-marquee__collection">
                        <div data-radial-marquee-rotate className="radial-marquee__list" data-radial-marquee>
                            {/* Repite este bloque por cada card (8 en este ejemplo) */}
                            <CardCarouselHome text="Storytelling" imageSrc="/images/home2.png" />
                            <CardCarouselHome text="Podcasting" imageSrc="/images/home3.png" />
                            <CardCarouselHome text="Creador de contenido" imageSrc="/images/home1.png" />
                            <CardCarouselHome text="Storytelling" imageSrc="/images/home2.png" />
                            <CardCarouselHome text="Podcasting" imageSrc="/images/home3.png" />
                            <CardCarouselHome text="Creador de contenido" imageSrc="/images/home1.png" />
                            <CardCarouselHome text="Storytelling" imageSrc="/images/home2.png" />
                            <CardCarouselHome text="Podcasting" imageSrc="/images/home3.png" />
                            <CardCarouselHome text="Creador de contenido" imageSrc="/images/home1.png" />
                            <CardCarouselHome text="Storytelling" imageSrc="/images/home2.png" />
                            <CardCarouselHome text="Podcasting" imageSrc="/images/home3.png" />
                            <CardCarouselHome text="Creador de contenido" imageSrc="/images/home1.png" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
