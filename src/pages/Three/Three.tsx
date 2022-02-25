/*
 * @Description: 
 * @Version: 2.0
 * @Autor: Mao 
 * @Date: 2022-01-26 17:10:34
 * @LastEditors: Mao 
 * @LastEditTime: 2022-02-22 14:32:58
 */
//  rafce
import * as THREE from 'three'
import React, { useCallback, useEffect, useRef } from 'react';
import TextArea from 'antd/lib/input/TextArea';

const Three = () => {
    const body = useRef<HTMLDivElement>(null)
    //创建场景
    const Scene = useRef(new THREE.Scene()).current
    //相机构造器
    const Camera: any = useRef(new THREE.PerspectiveCamera()).current
    // 渲染器
    const render = useRef(new THREE.WebGLRenderer({ antialias: true })).current
    // 物体or 网格null
    const meshs: any = useRef([]).current
    const Lights: Number[] = useRef([]).current

    const AnimationFrame: any = useRef(null)
    //设置宽高
    const init = useCallback(() => {
        render.setSize(body.current?.offsetHeight, body.current?.offsetWidth)  //设置渲染器的大小
        //设置相机的宽高比，角度
        Camera.aspect = body.current!.offsetHeight / body.current!.offsetWidth
        Camera.fov = 45
        Camera.near = 1
        Camera.far = 1000
        Camera.position.set(0, 0, 20)
        Camera.lookAt(0, 0, 0) //观察点在哪
        Camera.updateProjectionMatrix();  // 调用此方法更新相机投影的矩阵
        Scene.add(Camera); // 添加场景
    }, [render, body])
    //立方体
    const createRect = useCallback(() => {
        const geometry = new THREE.BoxGeometry(2, 2, 2); //设置立方体长宽高
        const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });  // 材质or皮肤
        const cube = new THREE.Mesh(geometry, material);
        cube.position.set(0, 0, 0)
        meshs.push(cube)
        Scene.add(cube); // 添加场景


    }, [])
    //线条立方体
    const createLine = useCallback(() => {
        //vertexColors 设定颜色
        const lineMater = new THREE.LineBasicMaterial({ vertexColors: true });
        const geometry = new THREE.BufferGeometry()
        // const color = new THREE.Color();  
        // const color1=[]
        const positions = [];
        const colors = [];
        for (let i = 0; i < 1000; i++) {
            const x = Math.random() * 2 - 1
            const y = Math.random() * 2 - 1
            const z = Math.random() * 2 - 1
            // positions
            positions.push(x, y, z)
            // colors
            colors.push(Math.random(), Math.random(), Math.random())
            // colors.push(Math.random())
            // colors.push(Math.random())
            // color.setHSL(Math.random(), Math.random(), Math.random());
            // color1.push(color.r, color.g, color.b);  
            /*
                colors.push( ( x / r ) + 0.5 );
                colors.push( ( y / r ) + 0.5 );
                colors.push( ( z / r ) + 0.5 );
             */
        }
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
        geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3))
        const mesh = new THREE.Line(geometry, lineMater); // 网格
        mesh.position.set(4, 0, 0);
        Scene.add(mesh);
        meshs.push(mesh);
    }, [])
    // 创建Lambert 网络材质
    const createLambert = useCallback(() => {

        const Lambert = new THREE.MeshLambertMaterial({ color: 'red' }); //材质or皮肤
        const rect = new THREE.BoxBufferGeometry(2, 2, 2);  //  
        const mesh = new THREE.Mesh(rect, Lambert);
        mesh.position.set(-4, 0, 0)
        meshs.push(mesh)
        Scene.add(mesh); // 添加场景


    }, [])
    // 创建Phong 网络材质
    const createPhong = useCallback(() => {
        const Phong = new THREE.MeshPhongMaterial({ color: 'red' }); //材质or皮肤
        const rect = new THREE.BoxBufferGeometry(2, 2, 2);  //  
        const mesh = new THREE.Mesh(rect, Phong);
        mesh.position.set(-8, 0, 0)
        meshs.push(mesh)
        Scene.add(mesh); // 添加场景
    }, [])
    //初始化灯光
    const createLight = useCallback(() => {
        const dirLight = new THREE.DirectionalLight('#ffffff', 1)  // 光颜色+光强度
        dirLight.position.set(100, 100, 100)
        const amlight = new THREE.AmbientLight('#ffffff', 0.5)
        const point = new THREE.PointLight('#ffffff', 2, 6)   //第三个参数是 光源到光强度0时距离
        point.position.set(0, 5, 0)

        Scene.add(point, amlight)
        Lights.push(point, amlight)

    }, [])
    //渲染画面
    const renderScene = useCallback(() => {
        render.render(Scene, Camera)
        meshs.forEach((item: any) => {
            item.rotation.x += 0.5 / 180 * Math.PI
            item.rotation.y += 0.5 / 180 * Math.PI

        })
        AnimationFrame.current = window.requestAnimationFrame(() => renderScene())  //重复帧循环 
    }, [render])
    //创建相机
    useEffect(() => {

        body.current?.append(render.domElement)
        init()
        createLight()
        createRect()
        createLine()
        renderScene()
        createLambert()
        createPhong()
        //卸载 销毁钩子
        return () => {
            cancelAnimationFrame(AnimationFrame.current)
            meshs.forEach((item: any) => {
                Scene.remove(item)
                item.geometry.dispose()
                item.material.dispose()
            })
            Lights.forEach((item: any) => {
                Scene.remove(item)
            })
            render.dispose()
            Scene.dispose()

        }
    }, [])


    return <div style={{ width: '800px', height: '1200px' }} ref={body}></div>;
};

export default Three;
