/*
 * @Description: 
 * @Version: 2.0
 * @Autor: Mao 
 * @Date: 2022-01-21 14:24:36
 * @LastEditors: Mao 
 * @LastEditTime: 2022-01-25 16:40:45
 */

import * as THREE from 'three'
import React, { useCallback, useEffect, useRef } from 'react';

const Three = () => {
    const body = useRef<HTMLDivElement>()
    //创建场景
    const Scene = useRef(new THREE.Scene()).current
    //相机构造器
    const Camera = useRef(new THREE.PerspectiveCamera()).current
    // 渲染器
    const render = useRef(new THREE.WebGLRenderer({ antialias: true })).current
    // 物体or 网格
    const meshs = useRef([]).current
    const AnimationFrame=useRef(null)
    //设置宽高
    const init = useCallback(() => {
        render.setSize(body.current?.offsetHeight, body.current?.offsetWidth)  //设置渲染器的大小
        //设置相机的宽高比，角度
        Camera.aspect = body.current.offsetHeight / body.current.offsetWidth
        Camera.fov = 45
        Camera.near = 1
        Camera.far = 1000
        Camera.position.set(0, 0, 20)
        Camera.lookAt(0, 0, 0) //观察点在哪
        Camera.updateProjectionMatrix();  // 调用此方法更新相机投影的矩阵
        Scene.add(Camera); // 添加场景
    }, [render, body])

    const createRect = useCallback(() => {
        const geometry = new THREE.BoxGeometry(2, 2, 2); //设置立方体长宽高
        const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });  // 材质or皮肤
        const cube = new THREE.Mesh(geometry, material);
        cube.position.set(0, 0, 0)
        meshs.push(cube)
        Scene.add(cube); // 添加场景


    }, [])
    //渲染画面
    const renderScene = useCallback(() => {
        render.render(Scene, Camera)
        meshs.forEach(item => {
            item.rotation.x += 0.5 / 180 * Math.PI
            item.rotation.y += 0.5 / 180 * Math.PI

        })
        AnimationFrame.current=  window.requestAnimationFrame(() => renderScene())  //重复帧循环 
    }, [render])
    //创建相机
    useEffect(() => {

        body.current?.append(render.domElement)
        init()
        createRect()
        renderScene()

        //卸载 销毁钩子
        return () => {
            cancelAnimationFrame(AnimationFrame.current)
            meshs.forEach(item => {
                Scene.remove(item)
                item.geometry.dispose()
                item.material.dispose()
            })
            render.dispose()
            Scene.dispose()

        }
    }, [])


    return <div style={{ width: '800px', height: '1200px' }} ref={body}></div>;
};

export default Three;
