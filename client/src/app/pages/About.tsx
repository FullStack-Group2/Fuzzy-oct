
// @ts-ignore
import couch from "../../assets/icon/couch.png"
// @ts-ignore
import livingRoom from "../../assets/icon/living-room.png"
// @ts-ignore
import couch2 from "../../assets/icon/couch2.png"

// ts-ignore
import tri from "../../assets/icon/tri_2.png"

// ts-ignore
import marcio from "../../assets/icon/duy_2.png"

// ts-ignore
import rachel from "../../assets/icon/rachel_2.png"

// ts-ignore
import tony from "../../assets/icon/tony_2.png"

// ts-ignore
import huy from "../../assets/icon/huy_2.png"

const About = () => {
    return <>
        <div>
            <div className="relative w-full h-[376px] overflow-hidden">
                <img
                    src={couch}
                    alt="Couch"
                    className="w-full h-auto relative z-0 -top-5"
                />

                <p className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 
                  text-ellipsis text-white text-3xl tracking-wide z-10 text-center">
                    WHERE COMFORT MEET PRESTIGE
                </p>

            </div>

            <div className={`grid grid-cols-1 md:grid-cols-2  items-center `}>
                <div className="space-y-6 px-4 ">
                    <span className="text-3xl font-bold space-y-6">Our story</span>
                    <br></br>

                    <p className="text-gray-700 leading-relaxed">Our journey began with a vision to redefine how people experience luxury furniture. We noticed that while many desired sophistication in their homes, the path to finding timeless and elegant pieces often felt complicated and exclusive. With this in mind, we built an online platform designed to make luxury both approachable and seamless. Every collection we curate reflects a deep respect for craftsmanship, blending traditional artistry with modern sensibilities. </p>

                    <p className="text-gray-700 leading-relaxed">We believe that furniture is not just functional—it carries stories, memories, and emotions that shape daily life. By focusing on quality over excess, we offer pieces that embody beauty without unnecessary complexity. Our story is ultimately about creating homes that inspire, uplift, and reflect the individuality of the people who live in them.</p>


                </div>

                <div className="overflow-hidden h-80 md:h-[400px]">
                    <img
                        src={livingRoom}
                        alt="Living room"
                        className="w-full h-full object-cover object-center"
                    />
                </div>

                <div className="overflow-hidden h-80 md:h-[400px]">
                    <img
                        src={couch2}
                        alt="Couch2"
                        className="w-full h-full object-cover object-center"
                    />
                </div>


                <div className="space-y-6 px-4">
                    <span className="text-3xl font-bold">Our focus</span>
                    <br></br>
                    <p className="text-gray-700 leading-relaxed">
                        Our focus is on curating luxury furniture that balances refinement with simplicity. We are committed to selecting designs that bring lasting elegance, ensuring each piece feels both timeless and relevant. Sustainability is central to our philosophy, and we prioritize materials and craftsmanship that respect both people and the planet. At the heart of our work lies the belief that luxury should never be overwhelming, it should enhance a space without dominating it. That is why our collections favor clean lines, subtle details, and natural finishes that create harmony in any room.</p>

                    <p className="text-gray-700 leading-relaxed">We strive to make the online experience as effortless as the furniture itself, offering a smooth journey from discovery to delivery. Ultimately, our focus is not only on furnishing homes but also on creating an atmosphere of comfort, sophistication, and enduring value.</p>


                </div>
            </div>

        </div>

        {/* Separate members section */}
        <div className="py-6 bg-white">
            <h2 className="text-3xl font-bold text-center mb-12">OUR MEMBERS</h2>

            {/* Use grid layout: 3 columns on large screens, 2 on medium, 1 on mobile */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-12 gap-x-8 ">
                {/* Member 1 */}
                <div className="flex flex-col items-center text-center">
                    <div className="relative w-[200] h-[208px]">
                        <div className=" absolute inset-1 bg-[#D2E4DD]  z-0"></div>
                        <img src={tony} className="w-[200px] relative z-10" />

                    </div>
                    <h3 className="mt-4 font-semibold text-lg">Pham Nhat Minh</h3>
                    <p className="w-[300px] break-words">
                        He is ambitious and forward-thinking, always pushing boundaries with bold ideas.                    </p>
                </div>

                {/* Member 2 */}
                <div className="flex flex-col items-center text-center">
                    <div className="relative w-[200] h-[208px]">
                        <div className=" absolute inset-1 bg-[#D2E4DD]  z-0"></div>
                        <img src={tri} className="w-[200px] relative z-10" />

                    </div>
                    <h3 className="mt-4 font-semibold text-lg">Truong Quoc Tri</h3>
                    <p className="w-[300px] break-words">
                        He is calm and thoughtful, bringing balance and clarity in every situation.
                    </p>
                </div>

                {/* Member 3 */}
                <div className="flex flex-col items-center text-center">
                    <div className="relative w-[200] h-[208px]">
                        <div className=" absolute inset-1 bg-[#D2E4DD]  z-0"></div>
                        <img src={marcio} className="w-[200px] relative z-10" />

                    </div>
                    <h3 className="mt-4 font-semibold text-lg">Le Nguyen Khuong Duy</h3>
                    <p className="w-[300px] break-words">
                        He is curious and inventive, never afraid to experiment and explore new perspectives.
                    </p>
                </div>

                {/* Member 4 */}
                <div className="flex flex-col items-center text-center">
                    <div className="relative w-[200] h-[208px]">
                        <div className=" absolute inset-1 bg-[#D2E4DD]  z-0"></div>
                        <img src={rachel} className="w-[200px] relative z-10" />

                    </div>
                    <h3 className="mt-4 font-semibold text-lg">Tran Tu Tam</h3>
                    <p className="w-[300px] break-words">
                        She is creative and empathetic, with a natural gift for connecting with people.
                    </p>
                </div>

                <div className="flex flex-col items-center text-center">
                    <div className="relative w-[200] h-[208px]">
                        <div className=" absolute inset-1 bg-[#D2E4DD]  z-0"></div>
                        <img src={huy} className="w-[200px] relative z-10" />

                    </div>
                    <h3 className="mt-4 font-semibold text-lg">Pham Gia Huy</h3>
                    <p className="w-[300px] break-words">
                        He is energetic and approachable, inspiring others with his optimism and drive.                    </p>
                </div>
            </div>
        </div>
    </>
};

export default About;