'use client';
import * as React from 'react';
import { Layout, Space } from 'antd';
import Image from 'next/image';
const { Header } = Layout;
export default function HeaderNav() {
    return(
        <Header style={{ display: "flex", alignItems: "center", justifyContent:'space-between', background: "#1669B2", height:'72px'}}>
            <Space style={{margin:'auto'}}>
                {<><Image
                                src="/LBI---logo-white-icon.png"
                                alt="Logicbase Logo"
                                width={60}
                                height={60}
                                priority={true}
                                
                                />
                                {/* <Text style={{ color: 'white', fontSize: '1.15rem', fontWeight: 'bold' }}>Logicbase Attendance System </Text> */}
                                </>

                                
                                }

                            {/* // MoneyCacheLogo as React.FC<React.SVGProps<SVGSVGElement>> 
                        } 
                        style={{
                            fontSize: '10rem',
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                        }}
                    /> */}
                {/* </Card> */}
            </Space>
        </Header>
    )
}