import React from "react";
import "~/styles/CarouselHome.css";

interface CardCarouselHomeProps {
    text?: string;
    imageSrc?: string;
}

export default function CardCarouselHome({
    text = "DISPONIBLE · DISPONIBLE · DISPONIBLE ·",
    imageSrc = "app/images/servicios1.png",
}: CardCarouselHomeProps) {

    return (
        
        <div className="radial-marquee__item">
            <div className="radial-marquee__card">
                <div className="radial-marquee__card-inner">
                    <div className="radial-marquee__card-visual">
                        <div className="resource-visual__before"></div>
                        <img src={imageSrc} alt="Servicio" className="resource-card__img" />
                    </div>
                    <div className="radial-marquee__card-info">
                        <p className="radial-marquee__card-p">{text}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
