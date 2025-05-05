'use client';
import * as React from 'react';
import { Layout } from 'antd'
const { Footer } = Layout;
export default function MyFooter() {
    return(
        <Footer style={{ textAlign: 'center' }}>
            Face Attendance ©{new Date().getFullYear()} Developed by Marie Glo Generalao
        </Footer>
    )
}